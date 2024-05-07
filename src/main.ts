import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loggerInterceptor } from './interceptors/loggerInterceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  const PORT = process.env.PORT || 5555;
  const CLIENT_URL = process.env.CLIENT_URL;
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new loggerInterceptor());
  app.enableCors({
    origin: CLIENT_URL,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(PORT, () => {
    console.log(`Server is running on port:${PORT}`);
  });
}
bootstrap();
