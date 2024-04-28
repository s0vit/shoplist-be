import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ExpensesDocument = HydratedDocument<Expenses>;

@Schema()
export class Expenses {
  @Prop()
  amount: number;

  @Prop()
  expensesTypeId: string;

  @Prop()
  paymentSourceId: string;

  @Prop()
  comments: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  @Prop()
  userId: string;
}

export const ExpansesSchema = SchemaFactory.createForClass(Expenses);
