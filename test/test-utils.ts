import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/configs/setupApp';

async function waitForConnection(connection: Connection, timeoutMs: number = 10000): Promise<void> {
  if (connection.readyState === 1) return;

  return new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Database connection timeout'));
    }, timeoutMs);

    connection.once('connected', () => {
      clearTimeout(timeout);
      resolve();
    });

    connection.once('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
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
    }).compile();

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
    if (connection) {
      await connection.dropDatabase();
      await new Promise((resolve) => setTimeout(resolve, 500));
      await connection.close();
    }

    if (app) await app.close();
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}
