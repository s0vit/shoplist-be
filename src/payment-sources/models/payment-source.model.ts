import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';

export type PaymentSourceDocument = HydratedDocument<PaymentSource>;

@Schema()
export class PaymentSource {
  _id: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  userId: string;

  @IsOptional()
  @Prop()
  comments?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const PaymentSourceSchema = SchemaFactory.createForClass(PaymentSource);
