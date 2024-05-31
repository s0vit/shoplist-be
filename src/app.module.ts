import { Module } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { appModuleImports } from './app.module.imports';

@Module({
  imports: appModuleImports,
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
