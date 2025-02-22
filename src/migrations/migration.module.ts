import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSource, PaymentSourceSchema } from '../app/payment-source/models/payment-source.model';
import { getMongoConfigs } from '../configs/get-mongo.configs';
import { Category, CategorySchema } from '../app/category/models/category.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoConfigs,
    }),
    MongooseModule.forFeature([{ name: PaymentSource.name, schema: PaymentSourceSchema, collection: 'PaymentSource' }]),
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema, collection: 'Category' }]),
  ],
})
export class MigrationModule {}
