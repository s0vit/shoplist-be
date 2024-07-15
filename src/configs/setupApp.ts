import { INestApplication } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { customValidationPipe } from '../pipes/customValidationPipe';
import ErrorExceptionFilter from '../utils/exeptionFilters/errorExeptionFilter';
import LoggerInterceptor from '../utils/interceptors/loggerInterceptor';
import { rootHtmlTemplate } from '../utils/templates/root-html.template';
import { setupSwagger } from './swagger.config';

export const setupApp = async (app: INestApplication) => {
  const CLIENT_URLS = process.env.CLIENT_URLS;
  app.setGlobalPrefix('api');
  app.getHttpAdapter().get('/', (req, res) => {
    const host = req.headers.host;
    const protocol = req.protocol;
    res.send(rootHtmlTemplate(host, protocol));
  });

  if (process.env.NODE_ENV !== 'test') {
    app.useGlobalInterceptors(new LoggerInterceptor());
  }

  app.useGlobalPipes(customValidationPipe);
  app.useGlobalFilters(new ErrorExceptionFilter());
  app.enableCors({
    origin: (origin, callback) => {
      const knownOrigins = JSON.parse(CLIENT_URLS);
      // if no origin - allow, for example, curl requests or postman
      if (!origin) return callback(null, true);

      if (knownOrigins.includes(origin) || origin.includes('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  app.use(cookieParser());
  setupSwagger(app);
};
