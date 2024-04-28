import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

type ExpensesTypeDocument = HydratedDocument<ExpensesType>;

@Schema()
export class ExpensesType {
  _id: string;
  @Prop()
  name: string;
}

export const ExpensesTypeSchema = SchemaFactory.createForClass(ExpensesType);
