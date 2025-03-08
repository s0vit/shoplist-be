import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CURRENCIES } from '../../../common/interfaces/currencies.enum';

export type PostponedExpenseDocument = HydratedDocument<PostponedExpense>;

@Schema()
export class PostponedExpense {
  _id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  categoryId: string;

  @Prop({ required: true })
  paymentSourceId: string;

  @Prop()
  comments?: string;

  @Prop({ required: true })
  currency: CURRENCIES;

  @Prop({ required: true })
  scheduledDate: Date;

  @Prop({ default: false })
  isProcessed: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop()
  processedAt?: Date;

  @Prop({ type: Object })
  processedExchangeRates?: Record<CURRENCIES, number>;
}

export const PostponedExpenseSchema = SchemaFactory.createForClass(PostponedExpense);
