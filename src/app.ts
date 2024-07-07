import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './configs/setupApp';

export const createAndSetupApp = async () => {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  await setupApp(app);

  return app;
};
