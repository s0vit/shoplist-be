import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ExpensesDocument = HydratedDocument<Expenses>;

@Schema()
export class Expenses {
  _id: Types.ObjectId;

  @Prop()
  amount: number;

  @Prop()
  userId: string;

  @Prop()
  categoryId: string;

  @Prop()
  paymentSourceId: string;

  @Prop()
  comments?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ExpansesSchema = SchemaFactory.createForClass(Expenses);
