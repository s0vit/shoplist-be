import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createAndSetupApp } from '../../app';
import { LoginInputDto } from '../auth/dto/login-input.dto';

describe('AuthController', () => {
  let app: INestApplication;
  let authTokens: { accessToken: string; refreshToken: string };

  const user = {
    email: 'test-user@unrealservice.com',
    password: 'Password123',
  };

  beforeAll(async () => {
    app = await createAndSetupApp();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should login a user', async () => {
      const loginDto: LoginInputDto = user;

      const response = await request(app.getHttpServer()).post('/api/auth/login').send(loginDto).expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      );

      authTokens = { accessToken: response.body.accessToken, refreshToken: response.body.refreshToken };
    });
  });

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
      const response = await request(app.getHttpServer())
        .delete('/api/user/delete-me')
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .expect(200);

      expect(response.text).toBe('User deleted');
    });
  });
});
