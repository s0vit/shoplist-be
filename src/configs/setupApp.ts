import { INestApplication } from '@nestjs/common';
import LoggerInterceptor from '../utils/interceptors/loggerInterceptor';
import { customValidationPipe } from '../pipes/customValidationPipe';
import ErrorExceptionFilter from '../utils/exeptionFilters/errorExeptionFilter';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as serveStatic from 'serve-static';

export const setupApp = async (app: INestApplication) => {
  const CLIENT_URLS = process.env.CLIENT_URLS;
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new LoggerInterceptor());
  app.useGlobalPipes(customValidationPipe);
  app.useGlobalFilters(new ErrorExceptionFilter());
  app.enableCors({
    origin: JSON.parse(CLIENT_URLS),
    credentials: true,
  });
  app.use(cookieParser());

  const options = new DocumentBuilder()
    .setTitle('Shoplist API')
    .setDescription('Shoplist API description')
    .setVersion('1.0')
    .addTag('Expenses')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/swagger', app, document);
  app.use('/swagger', serveStatic('node_modules/swagger-ui-dist', { index: ['index.html'] }));
};
