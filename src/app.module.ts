import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ExpensesTypeModule } from './expenses-type/expenses-type.module';
import { PaymentSourcesModule } from './payment-sources/payment-sources.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfigs } from './configs/get-mongo.configs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { configThrottling } from './configs/config-throttling';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoConfigs,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: configThrottling,
    }),
    AuthModule,
    ExpensesModule,
    ExpensesTypeModule,
    PaymentSourcesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
