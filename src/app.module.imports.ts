import { ModuleMetadata } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfigs } from './configs/get-mongo.configs';
import { ThrottlerModule } from '@nestjs/throttler';
import { configThrottling } from './configs/config-throttling';
import { AuthModule } from './app/auth/auth.module';
import { ExpensesModule } from './app/expenses/expenses.module';
import { CategoryModule } from './app/category/category.module';
import { UserModule } from './app/user/user.module';
import { PaymentSourcesModule } from './app/payment-sources/payment-sources.module';
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
  ExpensesModule,
  CategoryModule,
  PaymentSourcesModule,
  AccessControlModule,
  UserModule,
];
