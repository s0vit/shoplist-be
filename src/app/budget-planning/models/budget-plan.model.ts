import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AnalyticsTrendGranularity } from '../../expense/dto/expense-analytics-query.dto';
import { CURRENCIES } from '../../../common/interfaces/currencies.enum';

export type BudgetPlanDocument = HydratedDocument<BudgetPlan>;

export enum BudgetPlanStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

@Schema({ _id: false })
export class BudgetAlertState {
  @Prop({ type: Date, default: null })
  nearLimitNotifiedAt?: Date | null;

  @Prop({ type: Date, default: null })
  limitExceededNotifiedAt?: Date | null;
}

export const BudgetAlertStateSchema = SchemaFactory.createForClass(BudgetAlertState);

@Schema({ _id: false })
export class BudgetCategoryAllocation {
  @Prop({ required: true })
  categoryId: string;

  @Prop({ required: true })
  limit: number;

  @Prop({ type: BudgetAlertStateSchema, default: () => ({}) })
  alertState: BudgetAlertState;
}

export const BudgetCategoryAllocationSchema = SchemaFactory.createForClass(BudgetCategoryAllocation);

@Schema({ _id: false })
export class BudgetPaymentSourceAllocation {
  @Prop({ required: true })
  paymentSourceId: string;

  @Prop({ required: true })
  limit: number;

  @Prop({ type: BudgetAlertStateSchema, default: () => ({}) })
  alertState: BudgetAlertState;
}

export const BudgetPaymentSourceAllocationSchema = SchemaFactory.createForClass(BudgetPaymentSourceAllocation);

@Schema({
  timestamps: true,
  collection: 'BudgetPlan',
})
export class BudgetPlan {
  _id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  totalLimit: number;

  @Prop({ required: true, enum: CURRENCIES })
  currency: CURRENCIES;

  @Prop({ required: true })
  periodStart: Date;

  @Prop({ required: true })
  periodEnd: Date;

  @Prop({ required: true, enum: AnalyticsTrendGranularity })
  granularity: AnalyticsTrendGranularity;

  @Prop({ type: BudgetAlertStateSchema, default: () => ({}) })
  overallAlertState: BudgetAlertState;

  @Prop({ type: [BudgetCategoryAllocationSchema], default: [] })
  categoryAllocations: BudgetCategoryAllocation[];

  @Prop({ type: [BudgetPaymentSourceAllocationSchema], default: [] })
  paymentSourceAllocations: BudgetPaymentSourceAllocation[];

  @Prop({ enum: BudgetPlanStatus, default: BudgetPlanStatus.ACTIVE })
  status: BudgetPlanStatus;

  @Prop({ type: Date, default: null })
  archivedAt?: Date | null;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop({ default: null })
  originPlanId?: string | null;

  @Prop({ default: '' })
  title?: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ type: Object, default: () => ({}) })
  exchangeRatesSnapshot: Record<CURRENCIES, number>;

  @Prop({ type: Map, of: String, default: () => ({}) })
  metadata: Record<string, string>;
}

export const BudgetPlanSchema = SchemaFactory.createForClass(BudgetPlan);

BudgetPlanSchema.index({ userId: 1, status: 1 });
BudgetPlanSchema.index({ userId: 1, periodStart: 1, periodEnd: 1 });
