import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loggerInterceptor } from './interceptors/loggerInterceptor';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new loggerInterceptor());
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  await app.listen(3000, () => {
    console.log(`Server is running on port:${process.env.PORT || 3000}`);
  });
}
bootstrap();
