import { ConfigService } from '@nestjs/config';

export const getMongoConfigs = (configService: ConfigService) => {
  const dbAdminName = configService.get('DB_ADMIN_NAME');
  const dbAdminPassword = configService.get('DB_ADMIN_PASSWORD');
  const dbName = process.env.NODE_ENV === 'test' ? configService.get('TEST_DB_NAME') : configService.get('DB_NAME');

  return {
    uri: `mongodb+srv://${dbAdminName}:${dbAdminPassword}@cluster0.fujwcru.mongodb.net/${dbName}`,
  };
};
