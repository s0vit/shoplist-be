import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PaymentSourceDocument = HydratedDocument<PaymentSource>;

@Schema()
export class PaymentSource {
  _id: Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  userId: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PaymentSourceSchema = SchemaFactory.createForClass(PaymentSource);
