import { ConfigService } from '@nestjs/config';

export const getMongoConfigs = (configService: ConfigService) => {
  const dbAdminName = configService.get('DB_ADMIN_NAME');
  const dbAdminPassword = configService.get('DB_ADMIN_PASSWORD');
  const dbName = process.env.NODE_ENV === 'test' ? configService.get('TEST_DB_NAME') : configService.get('DB_NAME');

  const uri = `mongodb+srv://${dbAdminName}:${dbAdminPassword}@cluster0.fujwcru.mongodb.net/${dbName}`;

  return {
    uri,
    ...(process.env.NODE_ENV === 'test' && {
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 1000,
    }),
  };
};
