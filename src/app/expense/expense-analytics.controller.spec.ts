import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Connection, Types } from 'mongoose';
import * as request from 'supertest';
import { cleanupTestApp, setupTestApp } from '../../../test/test-utils';
import { CURRENCIES } from '../../common/interfaces/currencies.enum';

describe('Expense Analytics (e2e)', () => {
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
    await cleanupTestApp(app, connection);
  });

  it('returns aggregated analytics for current month with default filters', async () => {
    const collections = ['Expenses', 'Category', 'PaymentSource', 'User', 'UserConfig'];

    for (const name of collections) {
      await connection.collection(name).deleteMany({});
    }

    const userObjectId = new Types.ObjectId();
    const userId = userObjectId.toHexString();
    const userEmail = 'analytics@example.com';

    await connection.collection('User').insertOne({
      _id: userObjectId,
      email: userEmail,
      login: 'analytics',
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

    const categoryFoodId = new Types.ObjectId();
    const categoryFunId = new Types.ObjectId();

    await connection.collection('Category').insertMany([
      { _id: categoryFoodId, title: 'Еда', userId, order: 1 },
      { _id: categoryFunId, title: 'Развлечения', userId, order: 2 },
    ]);

    const paymentCardId = new Types.ObjectId();
    const paymentCashId = new Types.ObjectId();

    await connection.collection('PaymentSource').insertMany([
      { _id: paymentCardId, title: 'Карта', userId, order: 1 },
      { _id: paymentCashId, title: 'Наличные', userId, order: 2 },
    ]);

    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const spanWithinMonth = Math.max(now.getTime() - startOfMonth.getTime(), 3 * 60 * 60 * 1000);
    const step = Math.max(Math.floor(spanWithinMonth / 3), 1);
    const withinMonthTimestamp = new Date(startOfMonth.getTime() + step);
    const earlierWithinMonth = new Date(startOfMonth.getTime() + step * 2);
    const earliestWithinMonth = new Date(startOfMonth.getTime() + step * 3);
    const expenses = [
      {
        _id: new Types.ObjectId(),
        userId,
        amount: 50,
        categoryId: categoryFoodId.toHexString(),
        paymentSourceId: paymentCardId.toHexString(),
        currency: CURRENCIES.USD,
        exchangeRates: { USD: 1 },
        comments: 'Продукты',
        createdAt: withinMonthTimestamp,
        updatedAt: withinMonthTimestamp,
      },
      {
        _id: new Types.ObjectId(),
        userId,
        amount: 75,
        categoryId: categoryFoodId.toHexString(),
        paymentSourceId: paymentCashId.toHexString(),
        currency: CURRENCIES.USD,
        exchangeRates: { USD: 1 },
        comments: 'Ужин',
        createdAt: earlierWithinMonth,
        updatedAt: earlierWithinMonth,
      },
      {
        _id: new Types.ObjectId(),
        userId,
        amount: 25,
        categoryId: categoryFunId.toHexString(),
        paymentSourceId: paymentCardId.toHexString(),
        currency: CURRENCIES.USD,
        exchangeRates: { USD: 1 },
        comments: 'Кино',
        createdAt: earliestWithinMonth,
        updatedAt: earliestWithinMonth,
      },
    ];

    await connection.collection('Expenses').insertMany(expenses);

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

    const response = await request(app.getHttpServer())
      .get('/api/expense/analytics')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.summary).toMatchObject({
      totalAmount: 150,
      totalCount: 3,
      averageAmount: 50,
      minAmount: 25,
      maxAmount: 75,
      currency: CURRENCIES.USD,
    });

    expect(response.body.byCategory).toEqual([
      {
        id: categoryFoodId.toHexString(),
        name: 'Еда',
        totalAmount: 125,
        percentage: 83.33,
        count: 2,
      },
      {
        id: categoryFunId.toHexString(),
        name: 'Развлечения',
        totalAmount: 25,
        percentage: 16.67,
        count: 1,
      },
    ]);

    expect(response.body.byPaymentSource).toHaveLength(2);
    expect(response.body.byPaymentSource).toEqual(
      expect.arrayContaining([
        {
          id: paymentCardId.toHexString(),
          name: 'Карта',
          totalAmount: 75,
          percentage: 50,
          count: 2,
        },
        {
          id: paymentCashId.toHexString(),
          name: 'Наличные',
          totalAmount: 75,
          percentage: 50,
          count: 1,
        },
      ]),
    );

    expect(response.body.trend).toHaveLength(1);
    expect(response.body.trend[0]).toMatchObject({
      period: startOfMonth.toISOString().slice(0, 7),
      totalAmount: 150,
      averageAmount: 50,
      count: 3,
    });

    const startOfMonthUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)).toISOString();
    expect(response.body.appliedFilters.targetCurrency).toBe(CURRENCIES.USD);
    expect(response.body.appliedFilters.trendGranularity).toBe('month');
    expect(response.body.appliedFilters.createdStartDate).toBe(startOfMonthUtc);
    expect(new Date(response.body.appliedFilters.createdEndDate).getTime()).toBeGreaterThanOrEqual(
      expenses[0].createdAt.getTime(),
    );
  });
});
