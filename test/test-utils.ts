import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/configs/setupApp';

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

    if (connection.readyState !== 1) {
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Database connection timeout'));
        }, 5000);

        connection!.once('connected', () => {
          clearTimeout(timeout);
          resolve();
        });

        connection!.once('error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });
    }

    await connection.dropDatabase();
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
    if (connection) await connection.close();
    if (app) await app.close();
  } catch (error) {
    throw error;
  }
}
