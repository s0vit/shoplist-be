import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CurrencyRateDocument = HydratedDocument<CurrencyRate>;

@Schema()
export class CurrencyRate {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  base: string;

  @Prop({
    required: true,
    type: Object,
  })
  rates: Record<string, number>;
}

export const CurrencyRateSchema = SchemaFactory.createForClass(CurrencyRate);
