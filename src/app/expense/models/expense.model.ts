import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CURRENCIES } from 'src/common/interfaces/currencies.enum';

export type ExpensesDocument = HydratedDocument<Expense>;

@Schema()
export class Expense {
  _id: string;

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

  @Prop({ required: true })
  currency: string;

  @Prop({
    required: true,
    type: Object,
  })
  exchangeRates: Record<CURRENCIES, number>;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ExpansesSchema = SchemaFactory.createForClass(Expense);
