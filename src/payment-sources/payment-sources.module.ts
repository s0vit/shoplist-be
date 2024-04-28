import { Module } from '@nestjs/common';
import { PaymentSourcesController } from './payment-sources.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSources, PaymentSourcesSchema } from './payment-sources.schema';

@Module({
  controllers: [PaymentSourcesController],
  imports: [MongooseModule.forFeature([{ name: PaymentSources.name, schema: PaymentSourcesSchema }])],
})
export class PaymentSourcesModule {}
