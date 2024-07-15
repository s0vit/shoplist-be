import { ModuleMetadata } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AccessControlModule } from './app/access-control/access-control.module';
import { AuthModule } from './app/auth/auth.module';
import { CategoryModule } from './app/category/category.module';
import { CloudinaryModule } from './app/cloudinary/cloudinary.module';
import { CurrencyModule } from './app/currency/currency.module';
import { ExpenseModule } from './app/expense/expense.module';
import { PaymentSourcesModule } from './app/payment-source/payment-sources.module';
import { UserConfigModule } from './app/user-config/user-config.module';
import { UserModule } from './app/user/user.module';
import { configThrottling } from './configs/config-throttling';
import { getMongoConfigs } from './configs/get-mongo.configs';

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
  CloudinaryModule,
  CurrencyModule,
  UserConfigModule,
];
