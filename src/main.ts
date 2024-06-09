import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './configs/setupApp';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  const PORT = process.env.PORT || 5555;
  await setupApp(app);

  await app.listen(PORT, () => {
    console.info(`Server is running on port:${PORT}`);
  });
}

bootstrap();
