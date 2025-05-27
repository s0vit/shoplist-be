import { ConfigService } from '@nestjs/config';

export const getMongoConfigs = (configService: ConfigService) => {
  const dbAdminName = configService.get('DB_ADMIN_NAME');
  const dbAdminPassword = configService.get('DB_ADMIN_PASSWORD');
  const dbName = process.env.NODE_ENV === 'test' ? configService.get('TEST_DB_NAME') : configService.get('DB_NAME');

  // Use local MongoDB only in CI environment, Atlas for local development and production
  const isCI = process.env.CI === 'true';
  const uri = isCI
    ? `mongodb://${dbAdminName}:${dbAdminPassword}@localhost:27017/${dbName}?authSource=admin`
    : `mongodb+srv://${dbAdminName}:${dbAdminPassword}@cluster0.fujwcru.mongodb.net/${dbName}`;

  return {
    uri,
    ...(process.env.NODE_ENV === 'test' && {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 10000,
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 2000,
      maxPoolSize: 5,
      minPoolSize: 1,
    }),
  };
};
