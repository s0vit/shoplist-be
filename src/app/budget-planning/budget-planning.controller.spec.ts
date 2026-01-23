import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Connection, Types } from 'mongoose';
import * as request from 'supertest';
import { cleanupTestApp, setupTestApp } from '../../../test/test-utils';
import { CURRENCIES } from '../../common/interfaces/currencies.enum';
import { AnalyticsTrendGranularity } from '../expense/dto/expense-analytics-query.dto';
import { SchedulerRegistry } from '@nestjs/schedule';

type SeedContext = {
  accessToken: string;
  userId: string;
  categoryId: string;
  paymentSourceId: string;
  startOfMonth: Date;
  endOfMonth: Date;
};

const collectionsToReset = [
  'BudgetPlan',
  'BudgetAlert',
  'Expenses',
  'Category',
  'PaymentSource',
  'User',
  'UserConfig',
  'currencyrates',
];

const resetDatabase = async (connection: Connection) => {
  for (const name of collectionsToReset) {
    await connection.collection(name).deleteMany({});
  }
};

const seedBaseContext = async (
  connection: Connection,
  jwtService: JwtService,
  configService: ConfigService,
): Promise<SeedContext> => {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  await connection.collection('currencyrates').insertOne({
    date: new Date(),
    base: CURRENCIES.USD,
    rates: Object.values(CURRENCIES).reduce<Record<string, number>>((acc, currency) => {
      acc[currency] = 1;

      return acc;
    }, {}),
  });

  const userObjectId = new Types.ObjectId();
  const userId = userObjectId.toHexString();
  const userEmail = `${new Types.ObjectId().toHexString()}@budget.local`;

  await connection.collection('User').insertOne({
    _id: userObjectId,
    email: userEmail,
    login: `budget-${userId}`,
    passwordHash: 'hashed-password',
    isVerified: true,
  });

  await connection.collection('UserConfig').insertOne({
    _id: new Types.ObjectId(),
    userId,
    theme: 'light',
    currency: CURRENCIES.USD,
    language: 'ru',
    showCategoryNames: true,
    showSourceNames: true,
    showSharedExpenses: true,
    showSharedCategories: true,
    showSharedSources: true,
    showCategoryColours: true,
    showSourceColours: true,
  });

  const categoryId = new Types.ObjectId();
  const paymentSourceId = new Types.ObjectId();

  await connection.collection('Category').insertOne({
    _id: categoryId,
    title: 'Дом',
    userId,
    order: 1,
  });

  await connection.collection('PaymentSource').insertOne({
    _id: paymentSourceId,
    title: 'Карта',
    userId,
    order: 1,
  });

  const accessToken = await jwtService.signAsync(
    {
      userId,
      email: userEmail,
      isVerified: true,
    },
    {
      secret: configService.get<string>('ACCESS_TOKEN_KEY'),
    },
  );

  return {
    accessToken,
    userId,
    categoryId: categoryId.toHexString(),
    paymentSourceId: paymentSourceId.toHexString(),
    startOfMonth,
    endOfMonth,
  };
};

const createPlan = (
  app: INestApplication,
  ctx: SeedContext,
  payloadOverrides: Partial<Record<string, unknown>> = {},
  expectedStatus = 201,
) => {
  const basePayload = {
    title: 'Июль 2024',
    description: 'Базовый план расходов',
    totalLimit: 1000,
    currency: CURRENCIES.USD,
    periodStart: ctx.startOfMonth.toISOString(),
    periodEnd: ctx.endOfMonth.toISOString(),
    granularity: AnalyticsTrendGranularity.MONTH,
    categoryAllocations: [
      {
        categoryId: ctx.categoryId,
        limit: 800,
      },
    ],
    paymentSourceAllocations: [
      {
        paymentSourceId: ctx.paymentSourceId,
        limit: 800,
      },
    ],
    metadata: [
      {
        key: 'exportKey',
        value: 'july-2024',
      },
    ],
  };

  return request(app.getHttpServer())
    .post('/api/budget-planning')
    .set('Authorization', `Bearer ${ctx.accessToken}`)
    .send({ ...basePayload, ...payloadOverrides })
    .expect(expectedStatus);
};

const createExpense = (
  app: INestApplication,
  ctx: SeedContext,
  amount: number,
  createdAt: Date,
  expectedStatus = 200,
) => {
  return request(app.getHttpServer())
    .post('/api/expense')
    .set('Authorization', `Bearer ${ctx.accessToken}`)
    .send({
      amount,
      categoryId: ctx.categoryId,
      paymentSourceId: ctx.paymentSourceId,
      currency: CURRENCIES.USD,
      createdAt: createdAt.toISOString(),
    })
    .expect(expectedStatus);
};

// TODO: re-enable when budget planning endpoints are stable in tests
describe.skip('Budget Planning (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let jwtService: JwtService;
  let configService: ConfigService;

  beforeAll(async () => {
    const testSetup = await setupTestApp();
    app = testSetup.app;
    connection = testSetup.connection;
    jwtService = app.get(JwtService);
    configService = app.get(ConfigService);
  });

  afterAll(async () => {
    try {
      const scheduler = app.get(SchedulerRegistry);

      scheduler.getCronJobs().forEach((_, name) => scheduler.deleteCronJob(name));
      scheduler.getIntervals().forEach((name) => scheduler.deleteInterval(name));
      scheduler.getTimeouts().forEach((name) => scheduler.deleteTimeout(name));
    } catch (error) {
      // ignore – scheduler might be already cleaned up
    } finally {
      await cleanupTestApp(app, connection);
    }
  });

  beforeEach(async () => {
    await resetDatabase(connection);
  });

  it('rejects unauthenticated requests', async () => {
    await request(app.getHttpServer()).post('/api/budget-planning').send({}).expect(401);
    await request(app.getHttpServer()).get('/api/budget-planning/current').expect(401);
  });

  it('validates period boundaries on create', async () => {
    const ctx = await seedBaseContext(connection, jwtService, configService);

    await createPlan(app, ctx, {
      periodStart: ctx.endOfMonth.toISOString(),
      periodEnd: ctx.startOfMonth.toISOString(),
    }, 400);
  });

  it('creates plan and returns progress snapshot', async () => {
    const ctx = await seedBaseContext(connection, jwtService, configService);
    const response = await createPlan(app, ctx);

    expect(response.body.summary).toMatchObject({
      title: 'Июль 2024',
      totalLimit: 1000,
      currency: CURRENCIES.USD,
      spent: 0,
      remaining: 1000,
      usagePercentage: 0,
      originPlanId: null,
    });
    expect(response.body.summary.metadata).toEqual({ exportKey: 'july-2024' });
    expect(response.body.byCategory[0]).toMatchObject({
      id: ctx.categoryId,
      limit: 800,
      spent: 0,
      usagePercentage: 0,
      currency: CURRENCIES.USD,
    });
  });

  it('updates plan and resets alerts after exceeding thresholds', async () => {
    const ctx = await seedBaseContext(connection, jwtService, configService);
    const planResponse = await createPlan(app, ctx);
    const planId: string = planResponse.body.summary.id;

    const expenseAmounts = [600, 200, 250];
    for (const [index, amount] of expenseAmounts.entries()) {
      const createdAt = new Date(Date.UTC(ctx.startOfMonth.getUTCFullYear(), ctx.startOfMonth.getUTCMonth(), 5 + index));
      await createExpense(app, ctx, amount, createdAt);
    }

    const planAfterExpenses = await request(app.getHttpServer())
      .get('/api/budget-planning/current')
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .expect(200);

    expect(planAfterExpenses.body.summary.alertState.nearLimitNotifiedAt).not.toBeNull();
    expect(planAfterExpenses.body.summary.alertState.limitExceededNotifiedAt).not.toBeNull();

    const updateResponse = await request(app.getHttpServer())
      .patch(`/api/budget-planning/${planId}`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({
        totalLimit: 1500,
        metadata: [
          {
            key: 'exportKey',
            value: 'august-2024',
          },
        ],
      })
      .expect(200);

    expect(updateResponse.body.summary.totalLimit).toBe(1500);
    expect(updateResponse.body.summary.metadata).toEqual({ exportKey: 'august-2024' });
    expect(updateResponse.body.summary.alertState).toEqual({ nearLimitNotifiedAt: null, limitExceededNotifiedAt: null });
    expect(updateResponse.body.byCategory[0].alertState).toEqual({ nearLimitNotifiedAt: null, limitExceededNotifiedAt: null });
  });

  it('returns history after deletion and removes current plan', async () => {
    const ctx = await seedBaseContext(connection, jwtService, configService);
    const response = await createPlan(app, ctx);
    const planId: string = response.body.summary.id;

    await request(app.getHttpServer())
      .delete(`/api/budget-planning/${planId}`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .expect(204);

    const currentResponse = await request(app.getHttpServer())
      .get('/api/budget-planning/current')
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .expect(200);

    expect(currentResponse.body === null || Object.keys(currentResponse.body).length === 0).toBe(true);

    const historyResponse = await request(app.getHttpServer())
      .get('/api/budget-planning/history')
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .expect(200);

    expect(historyResponse.body).toHaveLength(1);
    expect(historyResponse.body[0].summary.status).toBe('deleted');
  });

  it('reactivates plan from history', async () => {
    const ctx = await seedBaseContext(connection, jwtService, configService);
    const response = await createPlan(app, ctx);
    const planId: string = response.body.summary.id;

    await request(app.getHttpServer())
      .delete(`/api/budget-planning/${planId}`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .expect(204);

    const nextMonthStart = new Date(Date.UTC(ctx.startOfMonth.getUTCFullYear(), ctx.startOfMonth.getUTCMonth() + 1, 1));
    const nextMonthEnd = new Date(Date.UTC(ctx.startOfMonth.getUTCFullYear(), ctx.startOfMonth.getUTCMonth() + 2, 0, 23, 59, 59, 999));

    const reactivatedResponse = await request(app.getHttpServer())
      .post(`/api/budget-planning/${planId}/activate`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({
        periodStart: nextMonthStart.toISOString(),
        periodEnd: nextMonthEnd.toISOString(),
      })
      .expect(201);

    expect(reactivatedResponse.body.summary.originPlanId).toBe(planId);
    expect(reactivatedResponse.body.summary.periodStart).toBe(nextMonthStart.toISOString());
    expect(reactivatedResponse.body.summary.spent).toBe(0);

    const currentResponse = await request(app.getHttpServer())
      .get('/api/budget-planning/current')
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .expect(200);

    expect(currentResponse.body.summary.id).toBe(reactivatedResponse.body.summary.id);
  });

  it('returns alerts with optional filtering', async () => {
    const ctx = await seedBaseContext(connection, jwtService, configService);
    const planResponse = await createPlan(app, ctx);
    const planId = planResponse.body.summary.id;

    const expenseAmounts = [600, 200, 250];
    for (const [index, amount] of expenseAmounts.entries()) {
      const createdAt = new Date(Date.UTC(ctx.startOfMonth.getUTCFullYear(), ctx.startOfMonth.getUTCMonth(), 5 + index));
      await createExpense(app, ctx, amount, createdAt);
    }

    const alertsResponse = await request(app.getHttpServer())
      .get('/api/budget-planning/alerts')
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .expect(200);

    expect(alertsResponse.body).toHaveLength(6);

    const filteredResponse = await request(app.getHttpServer())
      .get('/api/budget-planning/alerts')
      .query({ planId })
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .expect(200);

    expect(filteredResponse.body).toHaveLength(6);

    await request(app.getHttpServer())
      .delete(`/api/budget-planning/${planId}`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .expect(204);

    const nextMonthStart = new Date(Date.UTC(ctx.startOfMonth.getUTCFullYear(), ctx.startOfMonth.getUTCMonth() + 1, 1));
    const nextMonthEnd = new Date(Date.UTC(ctx.startOfMonth.getUTCFullYear(), ctx.startOfMonth.getUTCMonth() + 2, 0, 23, 59, 59, 999));

    const reactivated = await request(app.getHttpServer())
      .post(`/api/budget-planning/${planId}/activate`)
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .send({
        periodStart: nextMonthStart.toISOString(),
        periodEnd: nextMonthEnd.toISOString(),
      })
      .expect(201);

    const newPlanId = reactivated.body.summary.id;

    const newPlanAlerts = await request(app.getHttpServer())
      .get('/api/budget-planning/alerts')
      .query({ planId: newPlanId })
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .expect(200);

    expect(newPlanAlerts.body).toHaveLength(0);
  });

  it('integrates budget progress into expense analytics', async () => {
    const ctx = await seedBaseContext(connection, jwtService, configService);
    await createPlan(app, ctx);

    const createdAt = new Date(Date.UTC(ctx.startOfMonth.getUTCFullYear(), ctx.startOfMonth.getUTCMonth(), 3));
    await createExpense(app, ctx, 150, createdAt);

    const analyticsResponse = await request(app.getHttpServer())
      .get('/api/expense/analytics')
      .set('Authorization', `Bearer ${ctx.accessToken}`)
      .expect(200);

    expect(analyticsResponse.body.budgetPlan.summary.spent).toBe(150);
    expect(analyticsResponse.body.budgetPlan.byCategory[0].spent).toBe(150);
  });
});
