import { ModuleMetadata } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfigs } from './configs/get-mongo.configs';
import { ThrottlerModule } from '@nestjs/throttler';
import { configThrottling } from './configs/config-throttling';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { CategoryModule } from './category/category.module';
import { PaymentSourcesModule } from './payment-sources/payment-sources.module';
import { AccessControlModule } from './access-control/access-control.module';

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
];
