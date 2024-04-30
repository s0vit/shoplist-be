import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT;
  app.setGlobalPrefix('api');
  await app.listen(PORT, () => {
    console.log(`Server is running on port:${PORT || 3333}`);
  });
}

bootstrap();
