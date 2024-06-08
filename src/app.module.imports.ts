import { ModuleMetadata } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfigs } from './configs/get-mongo.configs';
import { ThrottlerModule } from '@nestjs/throttler';
import { configThrottling } from './configs/config-throttling';
import { AuthModule } from './app/auth/auth.module';
import { ExpenseModule } from './app/expense/expense.module';
import { CategoryModule } from './app/category/category.module';
import { UserModule } from './app/user/user.module';
import { PaymentSourcesModule } from './app/payment-source/payment-sources.module';
import { AccessControlModule } from './app/access-control/access-control.module';

export const appModuleImports: ModuleMetadata['imports'] = [
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
  ExpenseModule,
  CategoryModule,
  PaymentSourcesModule,
  AccessControlModule,
  UserModule,
];
