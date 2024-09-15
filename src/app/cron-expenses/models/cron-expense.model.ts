import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CURRENCIES } from '../../../common/interfaces/currencies.enum';
import { RECURRENCE_TYPES } from '../constants/RECURRENCE_TYPES';

export type CronExpenseDocument = CronExpense & Document;

@Schema()
export class CronExpense {
  _id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  categoryId: string;

  @Prop({ required: true })
  paymentSourceId: string;

  @Prop({ required: false })
  comments?: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  currency: CURRENCIES;

  @Prop({ required: true })
  recurrenceType: RECURRENCE_TYPES;

  @Prop({ required: false })
  recurrenceEndDate?: Date;
}

export const CronExpenseSchema = SchemaFactory.createForClass(CronExpense);
