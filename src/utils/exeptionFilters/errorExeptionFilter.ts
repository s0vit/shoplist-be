import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { SentryExceptionCaptured } from '@sentry/nestjs';

@Catch()
class ErrorExceptionFilter implements ExceptionFilter {
  @SentryExceptionCaptured()
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json({
        timestamp: new Date().toISOString(),
        path: ctx.getRequest().url,
        message: exception.message,
        meta: exception.getResponse(),
      });
    } else {
      response.status(500).json({
        timestamp: new Date().toISOString(),
        path: request.url,
        message: exception.message,
      });
    }
  }
}

export default ErrorExceptionFilter;
