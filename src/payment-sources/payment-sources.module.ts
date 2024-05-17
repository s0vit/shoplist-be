import { Module } from '@nestjs/common';
import { PaymentSourcesController } from './payment-sources.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSource, PaymentSourceSchema } from './models/payment-source.model';

@Module({
  controllers: [PaymentSourcesController],
  imports: [MongooseModule.forFeature([{ name: PaymentSource.name, schema: PaymentSourceSchema }])],
})
export class PaymentSourcesModule {}
