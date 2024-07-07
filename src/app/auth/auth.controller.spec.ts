import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createAndSetupApp } from '../../app';
import { AuthInputDto } from './dto/auth-input.dto';
import { LoginInputDto } from './dto/login-input.dto';

describe('AuthController', () => {
  let app: INestApplication;
  let authTokens: { accessToken: string; refreshToken: string };

  const user = {
    email: 'test-user@unrealservice.com',
    password: 'Password123',
  };
  let verificationToken = '';

  beforeAll(async () => {
    app = await createAndSetupApp();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a user', async () => {
      const registerDto: AuthInputDto = user;

      const response = await request(app.getHttpServer()).post('/api/auth/register').send(JSON.stringify(registerDto));

      console.log((await response.request).body);
      console.log(response.body);
      expect(response.status).toBe(201);
      expect(response.text).toMatch(/.+\..+\..+/); // JWT token
      verificationToken = response.text;
    }, 10000);

    it('should not register a user with the same email', async () => {
      const registerDto: AuthInputDto = user;

      await request(app.getHttpServer()).post('/api/auth/register').send(JSON.stringify(registerDto)).expect(400);
    });

    it('should not register a user with invalid email', async () => {
      const registerDto: AuthInputDto = { email: 'invalid-email', password: 'Password123' };

      await request(app.getHttpServer()).post('/api/auth/register').send(JSON.stringify(registerDto)).expect(400);
    });

    it('should not register a user with invalid password', async () => {
      const registerDto: AuthInputDto = { email: user.email, password: 'short' };

      await request(app.getHttpServer()).post('/api/auth/register').send(JSON.stringify(registerDto)).expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should not login a user with invalid credentials', async () => {
      const loginDto: LoginInputDto = { email: user.email, password: 'invalid-password' };

      await request(app.getHttpServer()).post('/api/auth/login').send(JSON.stringify(loginDto)).expect(400);
    });

    it('should login a user', async () => {
      const loginDto: LoginInputDto = user;

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(JSON.stringify(loginDto))
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      );
      expect(response.body.isVerified).toBeFalsy();

      authTokens = { accessToken: response.body.accessToken, refreshToken: response.body.refreshToken };
    });
  });

  describe('POST /auth/refresh', () => {
    it('should not refresh tokens with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send(JSON.stringify({ refreshToken: 'invalid-token' }))
        .expect(400);
    });

    it('should refresh tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send(JSON.stringify({ refreshToken: authTokens.refreshToken }))
        .expect(201);

      expect(response.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      );

      authTokens = { accessToken: response.body.accessToken, refreshToken: response.body.refreshToken };
    });
  });

  describe('POST /auth/request-confirm', () => {
    it('should request email confirmation', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/request-confirm')
        .set('Authorization', `Bearer ${authTokens.accessToken}`)
        .expect(201);
    }, 10000);

    it('should not request email confirmation with invalid access token', async () => {
      await request(app.getHttpServer()).post('/api/auth/request-confirm').expect(400);
    });

    it('should not request email confirmation with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/request-confirm')
        .set('Authorization', `Bearer invalid-token`)
        .expect(500);
    });
  });

  describe('GET /auth/confirm', () => {
    it('should not confirm user registration with invalid token', async () => {
      await request(app.getHttpServer()).get('/api/auth/confirm?token=invalid-token').expect(400);
    });
    it('should confirm user registration', async () => {
      await request(app.getHttpServer()).get(`/api/auth/confirm?token=${verificationToken}`).expect(200);
    });
    it('should login and observe user is verified', async () => {
      const loginDto: LoginInputDto = user;

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send(JSON.stringify(loginDto))
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      );
      expect(response.body.isVerified).toBeTruthy();
    });
  });
});
