import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CURRENCIES } from '../../../common/interfaces/currencies.enum';

export type BudgetAlertDocument = HydratedDocument<BudgetAlert>;

export enum BudgetAlertScope {
  OVERALL = 'overall',
  CATEGORY = 'category',
  PAYMENT_SOURCE = 'payment-source',
}

export enum BudgetAlertType {
  NEAR_LIMIT = 'near-limit',
  LIMIT_EXCEEDED = 'limit-exceeded',
}

@Schema({
  timestamps: true,
  collection: 'BudgetAlert',
})
export class BudgetAlert {
  _id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  budgetPlanId: string;

  @Prop({ required: true, enum: BudgetAlertScope })
  scope: BudgetAlertScope;

  @Prop({ default: null })
  scopeRefId?: string | null;

  @Prop({ required: true, enum: BudgetAlertType })
  type: BudgetAlertType;

  @Prop({ required: true })
  spentAmount: number;

  @Prop({ required: true })
  limitAmount: number;

  @Prop({ required: true })
  percentage: number;

  @Prop({ required: true, enum: CURRENCIES })
  currency: CURRENCIES;

  @Prop({ default: null })
  expenseId?: string | null;

  @Prop({ type: Date, required: true })
  triggeredAt: Date;
}

export const BudgetAlertSchema = SchemaFactory.createForClass(BudgetAlert);

BudgetAlertSchema.index({ userId: 1, budgetPlanId: 1, scope: 1, scopeRefId: 1, type: 1 }, { unique: true });
