import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { setupTestApp, cleanupTestApp } from '../../../test/test-utils';
import { AuthInputDto } from '../auth/dto/auth-input.dto';

describe('UserController', () => {
  let app: INestApplication;
  let connection: Connection;
  let authTokens: { accessToken: string; refreshToken: string };

  const user = {
    email: 'test-user@unrealservice.com',
    password: 'Password123',
  };

  beforeAll(async () => {
    try {
      const testSetup = await setupTestApp();
      app = testSetup.app;
      connection = testSetup.connection;

      const registerDto: AuthInputDto = user;
      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(registerDto)
        .expect(201);

      expect(registerResponse.status).toBe(201);
      const verificationToken = registerResponse.text;

      await request(app.getHttpServer()).get(`/api/auth/confirm?token=${verificationToken}`).expect(200);

      const loginResponse = await request(app.getHttpServer()).post('/api/auth/login').send(user).expect(200);

      expect(loginResponse.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          isVerified: true,
        }),
      );

      expect(loginResponse.body.accessToken).toBeTruthy();
      expect(loginResponse.body.refreshToken).toBeTruthy();

      authTokens = {
        accessToken: loginResponse.body.accessToken,
        refreshToken: loginResponse.body.refreshToken,
      };

      expect(authTokens.accessToken).toBeTruthy();
      expect(authTokens.refreshToken).toBeTruthy();
    } catch (error) {
      console.error('Error in beforeAll:', error);
      await cleanupTestApp(app, connection);
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    await cleanupTestApp(app, connection);
  }, 10000);

  describe('DELETE /user/delete-me', () => {
    it('should not delete a user without authorization', async () => {
      await request(app.getHttpServer()).delete('/api/user/delete-me').expect(401);
    });

    it('should not delete a user with invalid token', async () => {
      await request(app.getHttpServer())
        .delete('/api/user/delete-me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should delete a user', async () => {
      expect(authTokens.accessToken).toBeTruthy();

      const response = await request(app.getHttpServer())
        .delete('/api/user/delete-me')
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .expect(200);

      expect(response.text).toBe('User deleted');
    });
  });
});
