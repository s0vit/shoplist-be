import { ConfigService } from '@nestjs/config';

export const getMongoConfigs = async (configService: ConfigService) => {
  //getting the values from the .env file
  const dbAdminName = configService.get('DB_ADMIN_NAME');
  const dbAdminPassword = configService.get('DB_ADMIN_PASSWORD');
  const dbName = configService.get('DB_NAME');

  return {
    uri: `mongodb+srv://${dbAdminName}:${dbAdminPassword}@cluster0.fujwcru.mongodb.net//${dbName}`,
  };
};
