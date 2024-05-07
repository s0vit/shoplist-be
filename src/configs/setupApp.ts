import { INestApplication } from '@nestjs/common';
import LoggerInterceptor from '../utils/interceptors/loggerInterceptor';
import { customValidationPipe } from '../pipes/customValidationPipe';
import ErrorExceptionFilter from '../utils/exeptionFilters/errorExeptionFilter';

export const setupApp = async (app: INestApplication) => {
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new LoggerInterceptor());

  app.useGlobalPipes(customValidationPipe);
  app.useGlobalFilters(new ErrorExceptionFilter());
  app.enableCors();
};
