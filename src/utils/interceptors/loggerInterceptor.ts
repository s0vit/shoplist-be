import { CallHandler, ExecutionContext } from '@nestjs/common';
import { NestInterceptor } from '@nestjs/common/interfaces/features/nest-interceptor.interface';
import { Observable, tap } from 'rxjs';

class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    console.warn(`Request time UTC ${new Date().toUTCString()}`);
    console.warn(`Controller from ${context.getClass().name}`);
    console.warn(`Service from ${context.getHandler().name}`);
    console.warn(`Requester ip ${req.ip}`);
    console.warn(`Requester user agent ${req.headers['user-agent']}`);
    console.warn(`Requester body ${JSON.stringify(req.body)}`);
    console.warn(`Requester query ${JSON.stringify(req.query)}`);
    console.warn(`Request ID ${req.headers['x-request-id']}`);
    const now = Date.now();

    return next.handle().pipe(tap(() => console.warn(`Request took ${Date.now() - now}ms`)));
  }
}
export default LoggerInterceptor;
