import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/configs/setupApp';
import { CategoryService } from '../src/app/category/category.service';
import { PaymentSourceService } from '../src/app/payment-source/payment-source.service';

async function waitForConnection(connection: Connection, timeoutMs: number = 15000): Promise<void> {
  if (connection.readyState === 1) return;

  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Database connection timeout after ${timeoutMs}ms. ReadyState: ${connection.readyState}`));
    }, timeoutMs);

    const cleanup = () => {
      clearTimeout(timeout);
      connection.removeAllListeners('connected');
      connection.removeAllListeners('error');
    };

    connection.once('connected', () => {
      cleanup();
      resolve();
    });

    connection.once('error', (error) => {
      cleanup();
      reject(error);
    });

    // If already connecting, just wait
    if (connection.readyState === 2) {
      // Already connecting, just wait for the result
      return;
    }
  });
}

export async function setupTestApp(): Promise<{
  app: INestApplication;
  connection: Connection;
}> {
  let moduleFixture: TestingModule | undefined;
  let app: INestApplication | undefined;
  let connection: Connection | undefined;

  try {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('MailerService')
      .useValue({
        sendMail: jest.fn().mockResolvedValue(true),
      })
      .overrideProvider(CategoryService)
      .useValue({
        createDefaultCategories: jest.fn().mockResolvedValue(true),
      })
      .overrideProvider(PaymentSourceService)
      .useValue({
        createDefaultPaymentSources: jest.fn().mockResolvedValue(true),
      })
      .compile();

    // Set up test environment variables with fallbacks
    process.env.NODE_ENV = 'test';
    process.env.ACCESS_TOKEN_KEY = process.env.ACCESS_TOKEN_KEY || 'test-access-secret';
    process.env.REFRESH_TOKEN_KEY = process.env.REFRESH_TOKEN_KEY || 'test-refresh-secret';
    process.env.REGISTER_TOKEN_KEY = process.env.REGISTER_TOKEN_KEY || 'test-register-secret';
    process.env.CLIENT_URLS = process.env.CLIENT_URLS || '["http://localhost:3000"]';
    process.env.SMTP_HOST = process.env.SMTP_HOST || 'localhost';
    process.env.SMTP_PORT = process.env.SMTP_PORT || '587';
    process.env.SMTP_USER = process.env.SMTP_USER || 'test@example.com';
    process.env.SMTP_PASSWORD = process.env.SMTP_PASSWORD || 'test-password';
    process.env.MAIL_FROM = process.env.MAIL_FROM || 'test@example.com';

    app = moduleFixture.createNestApplication();
    connection = moduleFixture.get<Connection>(getConnectionToken());

    await waitForConnection(connection);
    await connection.dropDatabase();

    await new Promise((resolve) => setTimeout(resolve, 500));

    await setupApp(app);
    await app.init();

    return { app, connection };
  } catch (error) {
    if (connection) await connection.close().catch(console.error);
    if (app) await app.close().catch(console.error);
    throw error;
  }
}

export async function cleanupTestApp(app?: INestApplication, connection?: Connection): Promise<void> {
  try {
    if (connection && connection.readyState !== 0) {
      try {
        // Only try to drop database if connection is active
        if (connection.readyState === 1) {
          await Promise.race([
            connection.dropDatabase(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Drop database timeout')), 5000)),
          ]);
        }
      } catch (error) {
        console.warn('Failed to drop database during cleanup:', error instanceof Error ? error.message : String(error));
      }

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await Promise.race([
          connection.close(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Connection close timeout')), 5000)),
        ]);
      } catch (error) {
        console.warn(
          'Failed to close connection during cleanup:',
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    if (app) {
      try {
        await Promise.race([
          app.close(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('App close timeout')), 5000)),
        ]);
      } catch (error) {
        console.warn('Failed to close app during cleanup:', error instanceof Error ? error.message : String(error));
      }
    }
  } catch (error) {
    console.error('Error during cleanup:', error);
    // Don't throw error in cleanup to avoid masking original test failures
  }
}
