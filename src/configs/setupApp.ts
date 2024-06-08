import { INestApplication } from '@nestjs/common';
import LoggerInterceptor from '../utils/interceptors/loggerInterceptor';
import { customValidationPipe } from '../pipes/customValidationPipe';
import ErrorExceptionFilter from '../utils/exeptionFilters/errorExeptionFilter';
import * as cookieParser from 'cookie-parser';
import { setupSwagger } from './swagger.config';
import { rootHtmlTemplate } from '../utils/templates/root-html.template';

export const setupApp = async (app: INestApplication) => {
  const CLIENT_URLS = process.env.CLIENT_URLS;
  app.setGlobalPrefix('api');
  app.getHttpAdapter().get('/', (req, res) => {
    const host = req.headers.host;
    const protocol = req.protocol;
    res.send(rootHtmlTemplate(host, protocol));
  });
  app.useGlobalInterceptors(new LoggerInterceptor());
  app.useGlobalPipes(customValidationPipe);
  app.useGlobalFilters(new ErrorExceptionFilter());
  app.enableCors({
    origin: JSON.parse(CLIENT_URLS),
    credentials: true,
  });
  app.use(cookieParser());
  setupSwagger(app);
};
