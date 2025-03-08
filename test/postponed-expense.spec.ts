import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CURRENCIES } from '../src/common/interfaces/currencies.enum';
import { Connection } from 'mongoose';
import { setupTestApp, cleanupTestApp } from './test-utils';

describe('PostponedExpense (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let authToken: string;

  beforeAll(async () => {
    const testSetup = await setupTestApp();
    app = testSetup.app;
    connection = testSetup.connection;

    const loginResponse = await request(app.getHttpServer()).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await cleanupTestApp(app, connection);
  });

  describe('/api/postponed-expenses', () => {
    it('should create a postponed expense', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const createDto = {
        amount: 100,
        categoryId: 'category-id',
        paymentSourceId: 'source-id',
        currency: CURRENCIES.USD,
        scheduledDate: futureDate,
      };

      const response = await request(app.getHttpServer())
        .post('/api/postponed-expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        amount: createDto.amount,
        categoryId: createDto.categoryId,
        paymentSourceId: createDto.paymentSourceId,
        currency: createDto.currency,
        isProcessed: false,
      });
    });

    it('should get all postponed expenses', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/postponed-expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get a specific postponed expense', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const createResponse = await request(app.getHttpServer())
        .post('/api/postponed-expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100,
          categoryId: 'category-id',
          paymentSourceId: 'source-id',
          currency: CURRENCIES.USD,
          scheduledDate: futureDate,
        });

      const expenseId = createResponse.body._id;
      const response = await request(app.getHttpServer())
        .get(`/api/postponed-expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body._id).toBe(expenseId);
    });

    it('should update a postponed expense', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const createResponse = await request(app.getHttpServer())
        .post('/api/postponed-expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100,
          categoryId: 'category-id',
          paymentSourceId: 'source-id',
          currency: CURRENCIES.USD,
          scheduledDate: futureDate,
        });

      const expenseId = createResponse.body._id;

      const updateDto = {
        amount: 200,
        currency: CURRENCIES.EUR,
      };

      const response = await request(app.getHttpServer())
        .put(`/api/postponed-expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.amount).toBe(updateDto.amount);
      expect(response.body.currency).toBe(updateDto.currency);
    });

    it('should delete a postponed expense', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const createResponse = await request(app.getHttpServer())
        .post('/api/postponed-expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 100,
          categoryId: 'category-id',
          paymentSourceId: 'source-id',
          currency: CURRENCIES.USD,
          scheduledDate: futureDate,
        });

      const expenseId = createResponse.body._id;

      await request(app.getHttpServer())
        .delete(`/api/postponed-expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/postponed-expenses/${expenseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
