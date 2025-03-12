import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Connection } from 'mongoose';
import { setupTestApp, cleanupTestApp } from './test-utils';
import { DatabaseBackupService } from '../src/app/database-backup/database-backup.service';

describe('DatabaseBackup (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;
  let accessToken: string;

  // Mock the DatabaseBackupService to avoid actual backups during tests
  const mockDatabaseBackupService = {
    manualBackup: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const testSetup = await setupTestApp();
    app = testSetup.app;
    connection = testSetup.connection;

    // Override the DatabaseBackupService with our mock
    const databaseBackupService = app.get(DatabaseBackupService);
    databaseBackupService.manualBackup = mockDatabaseBackupService.manualBackup;

    // Login to get an access token for authenticated requests
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'test-user@unrealservice.com',
        password: 'Password123',
      });

    if (loginResponse.status !== 200) {
      // If login fails, register a user first
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test-user@unrealservice.com',
          password: 'Password123',
        });

      // Then login again
      const retryLoginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test-user@unrealservice.com',
          password: 'Password123',
        });

      accessToken = retryLoginResponse.body.accessToken;
    } else {
      accessToken = loginResponse.body.accessToken;
    }
  }, 30000);

  afterAll(async () => {
    await cleanupTestApp(app, connection);
  });

  describe('POST /database-backup/manual-backup', () => {
    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/database-backup/manual-backup')
        .expect(401);
    });

    it('should trigger a manual backup and return success message', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/database-backup/manual-backup')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Database backup process has been initiated.',
      });
      expect(mockDatabaseBackupService.manualBackup).toHaveBeenCalled();
    });
  });
});