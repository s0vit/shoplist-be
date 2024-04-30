import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { NestInterceptor } from '@nestjs/common/interfaces/features/nest-interceptor.interface';

export class loggerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log(`Request from ${context.getClass().name}...`);
    console.log('Before...');
    const now = Date.now();
    return next.handle().pipe(tap(() => console.log(`After... ${Date.now() - now}ms`)));
  }
}
