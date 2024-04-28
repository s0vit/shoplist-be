import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PaymentSourcesDocument = HydratedDocument<PaymentSources>;

@Schema()
export class PaymentSources {
  _id: string;
  @Prop()
  name: string;
}

export const PaymentSourcesSchema = SchemaFactory.createForClass(PaymentSources);
