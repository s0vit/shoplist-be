import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { NestInterceptor } from '@nestjs/common/interfaces/features/nest-interceptor.interface';

class LoggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.warn(`Request from ${context.getClass().name}...`);
    console.warn('Before...');
    const now = Date.now();

    return next.handle().pipe(tap(() => console.warn(`After... ${Date.now() - now}ms`)));
  }
}
export default LoggerInterceptor;
