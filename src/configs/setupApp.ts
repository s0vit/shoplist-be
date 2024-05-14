import { INestApplication } from '@nestjs/common';
import LoggerInterceptor from '../utils/interceptors/loggerInterceptor';
import { customValidationPipe } from '../pipes/customValidationPipe';
import ErrorExceptionFilter from '../utils/exeptionFilters/errorExeptionFilter';
import * as cookieParser from 'cookie-parser';

export const setupApp = async (app: INestApplication) => {
  const CLIENT_URL = process.env.CLIENT_URL;
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new LoggerInterceptor());

  app.useGlobalPipes(customValidationPipe);
  app.useGlobalFilters(new ErrorExceptionFilter());
  app.enableCors({
    origin: CLIENT_URL,
    credentials: true,
  });
  app.use(cookieParser());
};
