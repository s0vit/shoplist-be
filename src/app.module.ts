import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ExpensesTypeModule } from './expenses-type/expenses-type.module';
import { PaymentSourcesModule } from './payment-sources/payment-sources.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfigs } from './configs/getMongoConfigs';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoConfigs,
    }),
    AuthModule,
    ExpensesModule,
    ExpensesTypeModule,
    PaymentSourcesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
