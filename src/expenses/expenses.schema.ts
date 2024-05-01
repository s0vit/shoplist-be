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
  userId: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  constructor(amount: number, expensesTypeId: string, paymentSourceId: string, comments: string, userId: string) {
    this.amount = amount;
    this.expensesTypeId = expensesTypeId;
    this.paymentSourceId = paymentSourceId;
    this.comments = comments;
    this.userId = userId;
  }
}

export const ExpansesSchema = SchemaFactory.createForClass(Expenses);
