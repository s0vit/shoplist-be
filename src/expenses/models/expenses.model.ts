import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ExpensesDocument = HydratedDocument<Expenses>;

@Schema()
export class Expenses {
  _id: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  categoryId: string;

  @Prop({ required: true })
  paymentSourceId: string;

  @Prop()
  comments?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ExpansesSchema = SchemaFactory.createForClass(Expenses);
