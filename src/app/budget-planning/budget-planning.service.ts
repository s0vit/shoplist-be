import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PipelineStage, Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Expense } from '../expense/models/expense.model';
import { BudgetNotificationService } from './budget-notification.service';
import {
  BudgetAlertState,
  BudgetCategoryAllocation,
  BudgetPlan,
  BudgetPlanDocument,
  BudgetPlanStatus,
  BudgetPaymentSourceAllocation,
} from './models/budget-plan.model';
import { CreateBudgetPlanDto } from './dto/create-budget-plan.dto';
import { UpdateBudgetPlanDto } from './dto/update-budget-plan.dto';
import {
  BudgetAllocationProgressDto,
  BudgetPlanProgressDto,
  BudgetPlanResponseDto,
  BudgetPlanSummaryDto,
} from './dto/budget-plan-response.dto';
import { CURRENCIES } from '../../common/interfaces/currencies.enum';
import { AnalyticsTrendGranularity } from '../expense/dto/expense-analytics-query.dto';
import { CurrencyService } from '../currency/currency.service';
import { ActivateBudgetPlanDto } from './dto/activate-budget-plan.dto';
import { BudgetAlertScope, BudgetAlertType } from './models/budget-alert.model';
import { BudgetAlertResponseDto } from './dto/budget-alert-response.dto';
import { ExpenseAnalyticsQueryDto } from '../expense/dto/expense-analytics-query.dto';
import { Category, CategoryDocument } from '../category/models/category.model';
import { PaymentSource, PaymentSourceDocument } from '../payment-source/models/payment-source.model';

const NEAR_LIMIT_THRESHOLD = 0.7;

type ExpenseEventPayload = {
  _id?: string;
  userId: string;
  categoryId: string;
  paymentSourceId: string;
  createdAt: Date;
};

type AggregatedSummary = {
  totalAmount?: number;
  totalCount?: number;
};

type AggregatedBreakdown = {
  _id: string | null;
  totalAmount: number;
  count: number;
};

@Injectable()
export class BudgetPlanningService {
  private readonly logger = new Logger(BudgetPlanningService.name);

  constructor(
    @InjectModel(BudgetPlan.name)
    private readonly budgetPlanModel: Model<BudgetPlanDocument>,
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<Expense>,
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(PaymentSource.name)
    private readonly paymentSourceModel: Model<PaymentSourceDocument>,
    private readonly currencyService: CurrencyService,
    private readonly budgetNotificationService: BudgetNotificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async archiveOutdatedPlans(): Promise<void> {
    try {
      const now = new Date();
      const result = await this.budgetPlanModel.updateMany(
        {
          status: BudgetPlanStatus.ACTIVE,
          periodEnd: { $lt: now },
        },
        {
          $set: {
            status: BudgetPlanStatus.ARCHIVED,
            archivedAt: now,
          },
        },
      );

      if (result.modifiedCount > 0) {
        this.logger.log(`Archived ${result.modifiedCount} outdated budget plans.`);
      }
    } catch (error: any) {
      this.logger.error('Failed to archive outdated plans', error.stack);
    }
  }

  async createPlan(dto: CreateBudgetPlanDto, userId: string): Promise<BudgetPlanResponseDto> {
    try {
      const periodStart = this.normalizeDateStart(dto.periodStart);
      const periodEnd = this.normalizeDateEnd(dto.periodEnd);

      if (periodEnd.getTime() < periodStart.getTime()) {
        throw new BadRequestException('periodEnd must be after periodStart');
      }

      this.ensureGranularityAlignment(periodStart, periodEnd, dto.granularity);

      const metadata = this.mapMetadataEntries(dto.metadata);
      const categoryAllocations = this.normalizeCategoryAllocations(dto.categoryAllocations);
      const paymentSourceAllocations = this.normalizePaymentSourceAllocations(dto.paymentSourceAllocations);

      const exchangeRatesSnapshot = await this.buildExchangeRatesSnapshot(dto.currency);

      await this.archiveActivePlan(userId);

      const createdPlan = await this.budgetPlanModel.create({
        userId,
        title: dto.title?.trim(),
        description: dto.description?.trim(),
        totalLimit: dto.totalLimit,
        currency: dto.currency,
        periodStart,
        periodEnd,
        granularity: dto.granularity,
        categoryAllocations,
        paymentSourceAllocations,
        metadata,
        exchangeRatesSnapshot,
      });

      return this.buildPlanResponse(await createdPlan.populate([]));
    } catch (error: any) {
      this.logger.error(`Failed to create plan for user ${userId}`, error.stack);
      throw error;
    }
  }

  async updatePlan(planId: string, dto: UpdateBudgetPlanDto, userId: string): Promise<BudgetPlanResponseDto> {
    try {
      const plan = await this.budgetPlanModel.findOne({ _id: planId, userId });

      if (!plan) {
        throw new NotFoundException('Budget plan not found');
      }

      if (plan.status !== BudgetPlanStatus.ACTIVE) {
        throw new BadRequestException('Only active plans can be updated');
      }

      let requiresAlertReset = false;

      if (dto.totalLimit !== undefined) {
        if (dto.totalLimit <= 0) {
          throw new BadRequestException('totalLimit must be greater than 0');
        }

        plan.totalLimit = dto.totalLimit;
        requiresAlertReset = true;
      }

      if (dto.currency && dto.currency !== plan.currency) {
        plan.currency = dto.currency;
        plan.exchangeRatesSnapshot = await this.buildExchangeRatesSnapshot(dto.currency);
        requiresAlertReset = true;
      }

      if (dto.periodStart || dto.periodEnd || dto.granularity) {
        const periodStart = this.normalizeDateStart(dto.periodStart ?? plan.periodStart.toISOString());
        const periodEnd = this.normalizeDateEnd(dto.periodEnd ?? plan.periodEnd.toISOString());
        const granularity = dto.granularity ?? plan.granularity;

        if (periodEnd.getTime() < periodStart.getTime()) {
          throw new BadRequestException('periodEnd must be after periodStart');
        }

        this.ensureGranularityAlignment(periodStart, periodEnd, granularity);

        plan.periodStart = periodStart;
        plan.periodEnd = periodEnd;
        plan.granularity = granularity;
        requiresAlertReset = true;
      }

      if (dto.title !== undefined) {
        plan.title = dto.title?.trim();
      }

      if (dto.description !== undefined) {
        plan.description = dto.description?.trim();
      }

      if (dto.metadata) {
        plan.metadata = this.mapMetadataEntries(dto.metadata);
      }

      if (dto.categoryAllocations) {
        plan.categoryAllocations = this.normalizeCategoryAllocations(dto.categoryAllocations);
        requiresAlertReset = true;
      }

      if (dto.paymentSourceAllocations) {
        plan.paymentSourceAllocations = this.normalizePaymentSourceAllocations(dto.paymentSourceAllocations);
        requiresAlertReset = true;
      }

      if (requiresAlertReset) {
        plan.overallAlertState = {
          nearLimitNotifiedAt: null,
          limitExceededNotifiedAt: null,
        };
        plan.categoryAllocations = plan.categoryAllocations.map((allocation) => ({
          ...allocation,
          alertState: {
            nearLimitNotifiedAt: null,
            limitExceededNotifiedAt: null,
          },
        }));
        plan.paymentSourceAllocations = plan.paymentSourceAllocations.map((allocation) => ({
          ...allocation,
          alertState: {
            nearLimitNotifiedAt: null,
            limitExceededNotifiedAt: null,
          },
        }));

        plan.markModified('overallAlertState');
        plan.markModified('categoryAllocations');
        plan.markModified('paymentSourceAllocations');
      }

      await plan.save();

      return this.buildPlanResponse(plan);
    } catch (error: any) {
      this.logger.error(`Failed to update plan ${planId} for user ${userId}`, error.stack);
      throw error;
    }
  }

  async deletePlan(planId: string, userId: string): Promise<void> {
    try {
      const result = await this.budgetPlanModel.deleteOne({ _id: planId, userId });

      if (result.deletedCount === 0) {
        throw new NotFoundException('Budget plan not found');
      }
    } catch (error: any) {
      this.logger.error(`Failed to delete plan ${planId} for user ${userId}`, error.stack);
      throw error;
    }
  }

  async getCurrentPlan(userId: string): Promise<BudgetPlanResponseDto | null> {
    try {
      const plan = await this.budgetPlanModel.findOne({
        userId,
        status: BudgetPlanStatus.ACTIVE,
      });

      if (!plan) {
        return null;
      }

      return this.buildPlanResponse(plan);
    } catch (error: any) {
      this.logger.error(`Failed to get current plan for user ${userId}`, error.stack);
      throw error;
    }
  }

  async listHistory(userId: string): Promise<BudgetPlanResponseDto[]> {
    try {
      const plans = await this.budgetPlanModel
        .find({ userId, status: { $in: [BudgetPlanStatus.ARCHIVED, BudgetPlanStatus.DELETED] } })
        .sort({ periodStart: -1 });

      return Promise.all(plans.map((plan) => this.buildPlanResponse(plan)));
    } catch (error: any) {
      this.logger.error(`Failed to list history for user ${userId}`, error.stack);
      throw error;
    }
  }

  async activateFromHistory(
    planId: string,
    dto: ActivateBudgetPlanDto,
    userId: string,
  ): Promise<BudgetPlanResponseDto> {
    try {
      const sourcePlan = await this.budgetPlanModel.findOne({ _id: planId, userId });

      if (!sourcePlan) {
        throw new NotFoundException('Source budget plan not found');
      }

      if (sourcePlan.status === BudgetPlanStatus.ACTIVE) {
        throw new BadRequestException('Plan is already active');
      }

      const periodStart = this.normalizeDateStart(dto.periodStart ?? this.calculateDefaultPeriodStart(sourcePlan));
      const periodEnd = this.normalizeDateEnd(
        dto.periodEnd ?? this.calculateDefaultPeriodEnd(periodStart, sourcePlan.granularity),
      );

      this.ensureGranularityAlignment(periodStart, periodEnd, sourcePlan.granularity);

      await this.archiveActivePlan(userId);

      const recreatedPlan = await this.budgetPlanModel.create({
        userId,
        title: sourcePlan.title,
        description: sourcePlan.description,
        totalLimit: sourcePlan.totalLimit,
        currency: sourcePlan.currency,
        periodStart,
        periodEnd,
        granularity: sourcePlan.granularity,
        categoryAllocations: sourcePlan.categoryAllocations?.map((allocation) => this.cloneAllocation(allocation)),
        paymentSourceAllocations: sourcePlan.paymentSourceAllocations?.map((allocation) =>
          this.cloneAllocation(allocation),
        ),
        metadata: sourcePlan.metadata,
        exchangeRatesSnapshot: await this.refreshExchangeRatesSnapshot(sourcePlan.currency),
        originPlanId: sourcePlan._id.toString(),
      });

      return this.buildPlanResponse(await recreatedPlan.populate([]));
    } catch (error: any) {
      this.logger.error(`Failed to activate plan ${planId} from history for user ${userId}`, error.stack);
      throw error;
    }
  }

  async listAlerts(userId: string, planId?: string): Promise<BudgetAlertResponseDto[]> {
    try {
      return this.budgetNotificationService.listAlerts(userId, planId);
    } catch (error: any) {
      this.logger.error(`Failed to list alerts for user ${userId}`, error.stack);
      throw error;
    }
  }

  async handleExpenseCreated(expense: ExpenseEventPayload): Promise<void> {
    const plan = await this.budgetPlanModel.findOne({
      userId: expense.userId,
      status: BudgetPlanStatus.ACTIVE,
    });

    if (!plan) {
      return;
    }

    const expenseDate = new Date(expense.createdAt);

    if (expenseDate < plan.periodStart || expenseDate > plan.periodEnd) {
      return;
    }

    const progress = await this.computePlanProgress(plan, { resolveNames: false });
    await this.evaluateAlerts(plan, progress, expense);
  }

  async getPlanProgressForAnalytics(
    userId: string,
    query: ExpenseAnalyticsQueryDto,
    targetCurrency: CURRENCIES,
  ): Promise<BudgetPlanProgressDto | null> {
    const plan = await this.budgetPlanModel.findOne({ userId, status: BudgetPlanStatus.ACTIVE });

    if (!plan) {
      return null;
    }

    if (!this.doesPlanOverlapQuery(plan, query)) {
      return null;
    }

    return this.computePlanProgress(plan, { targetCurrency, resolveNames: true });
  }

  private async evaluateAlerts(
    plan: BudgetPlanDocument,
    progress: BudgetPlanProgressDto,
    expense: ExpenseEventPayload,
  ): Promise<void> {
    const now = new Date();
    let shouldPersist = false;

    const overallExceeded = this.evaluateAlert(
      plan,
      progress.summary,
      plan.overallAlertState ?? { nearLimitNotifiedAt: null, limitExceededNotifiedAt: null },
      BudgetAlertScope.OVERALL,
      null,
      expense,
      now,
    );

    if (overallExceeded) {
      plan.overallAlertState = overallExceeded;
      plan.markModified('overallAlertState');
      shouldPersist = true;
    }

    const categoryAllocation = plan.categoryAllocations.find(
      (allocation) => allocation.categoryId === expense.categoryId,
    );

    if (categoryAllocation) {
      const categoryProgress = progress.byCategory.find((item) => item.id === categoryAllocation.categoryId);

      if (categoryProgress) {
        const updatedAlert = this.evaluateAlert(
          plan,
          categoryProgress,
          categoryAllocation.alertState ?? { nearLimitNotifiedAt: null, limitExceededNotifiedAt: null },
          BudgetAlertScope.CATEGORY,
          categoryAllocation.categoryId,
          expense,
          now,
        );

        if (updatedAlert) {
          categoryAllocation.alertState = updatedAlert;
          plan.markModified('categoryAllocations');
          shouldPersist = true;
        }
      }
    }

    const paymentSourceAllocation = plan.paymentSourceAllocations.find(
      (allocation) => allocation.paymentSourceId === expense.paymentSourceId,
    );

    if (paymentSourceAllocation) {
      const sourceProgress = progress.byPaymentSource.find(
        (item) => item.id === paymentSourceAllocation.paymentSourceId,
      );

      if (sourceProgress) {
        const updatedAlert = this.evaluateAlert(
          plan,
          sourceProgress,
          paymentSourceAllocation.alertState ?? { nearLimitNotifiedAt: null, limitExceededNotifiedAt: null },
          BudgetAlertScope.PAYMENT_SOURCE,
          paymentSourceAllocation.paymentSourceId,
          expense,
          now,
        );

        if (updatedAlert) {
          paymentSourceAllocation.alertState = updatedAlert;
          plan.markModified('paymentSourceAllocations');
          shouldPersist = true;
        }
      }
    }

    if (shouldPersist) {
      plan.markModified('overallAlertState');
      plan.markModified('categoryAllocations');
      plan.markModified('paymentSourceAllocations');
      await plan.save();
    }
  }

  private evaluateAlert(
    plan: BudgetPlanDocument,
    progress: BudgetPlanSummaryDto | BudgetAllocationProgressDto,
    alertState: BudgetAlertState,
    scope: BudgetAlertScope,
    scopeRefId: string | null,
    expense: ExpenseEventPayload,
    triggeredAt: Date,
  ): BudgetAlertState | null {
    const limit = 'totalLimit' in progress ? progress.totalLimit : progress.limit;
    const spent = progress.spent;

    if (limit <= 0) {
      return null;
    }

    const usage = spent / limit;
    const nextAlertState: BudgetAlertState = { ...alertState };
    const currency = 'currency' in progress ? progress.currency : plan.currency;

    if (!alertState?.nearLimitNotifiedAt && usage >= NEAR_LIMIT_THRESHOLD) {
      nextAlertState.nearLimitNotifiedAt = triggeredAt;
      void this.budgetNotificationService.createAlert({
        userId: plan.userId,
        budgetPlanId: plan._id.toString(),
        scope,
        scopeRefId,
        type: BudgetAlertType.NEAR_LIMIT,
        spentAmount: this.round(spent),
        limitAmount: this.round(limit),
        percentage: this.round(usage * 100),
        currency,
        expenseId: expense._id?.toString?.() ?? null,
        triggeredAt,
      });
    }

    if (!alertState?.limitExceededNotifiedAt && usage >= 1) {
      nextAlertState.limitExceededNotifiedAt = triggeredAt;
      void this.budgetNotificationService.createAlert({
        userId: plan.userId,
        budgetPlanId: plan._id.toString(),
        scope,
        scopeRefId,
        type: BudgetAlertType.LIMIT_EXCEEDED,
        spentAmount: this.round(spent),
        limitAmount: this.round(limit),
        percentage: this.round(usage * 100),
        currency,
        expenseId: expense._id?.toString?.() ?? null,
        triggeredAt,
      });
    }

    if (
      nextAlertState.nearLimitNotifiedAt !== alertState?.nearLimitNotifiedAt ||
      nextAlertState.limitExceededNotifiedAt !== alertState?.limitExceededNotifiedAt
    ) {
      return nextAlertState;
    }

    return null;
  }

  private async buildPlanResponse(plan: BudgetPlanDocument): Promise<BudgetPlanResponseDto> {
    return this.computePlanProgress(plan, { resolveNames: true });
  }

  private async computePlanProgress(
    plan: BudgetPlanDocument,
    options: { targetCurrency?: CURRENCIES; resolveNames: boolean },
  ): Promise<BudgetPlanProgressDto> {
    const targetCurrency = options.targetCurrency ?? plan.currency;
    const conversionRate = await this.getConversionMultiplier(plan, targetCurrency);
    const aggregated = await this.aggregatePlanExpenses(plan);

    const totalSpentPlanCurrency = this.round(aggregated.summary?.[0]?.totalAmount ?? 0);

    const categorySpendMap = new Map<string, number>();
    const sourceSpendMap = new Map<string, number>();

    for (const item of aggregated.categoryBreakdown ?? []) {
      if (!item?._id) continue;
      categorySpendMap.set(item._id, this.round(item.totalAmount));
    }

    for (const item of aggregated.paymentSourceBreakdown ?? []) {
      if (!item?._id) continue;
      sourceSpendMap.set(item._id, this.round(item.totalAmount));
    }

    const categoryIds = plan.categoryAllocations.map((allocation) => allocation.categoryId);
    const paymentSourceIds = plan.paymentSourceAllocations.map((allocation) => allocation.paymentSourceId);

    const [categoryNames, paymentSourceNames] = options.resolveNames
      ? await Promise.all([this.resolveCategoryNames(categoryIds), this.resolvePaymentSourceNames(paymentSourceIds)])
      : [{}, {}];

    const convert = (value: number) => this.round(value * conversionRate);

    const summary: BudgetPlanSummaryDto = {
      id: plan._id.toString(),
      status: plan.status,
      title: plan.title ?? undefined,
      description: plan.description ?? null,
      totalLimit: convert(plan.totalLimit),
      currency: targetCurrency,
      periodStart: plan.periodStart.toISOString(),
      periodEnd: plan.periodEnd.toISOString(),
      granularity: plan.granularity,
      spent: convert(totalSpentPlanCurrency),
      remaining: convert(Math.max(plan.totalLimit - totalSpentPlanCurrency, 0)),
      usagePercentage: this.round(
        plan.totalLimit > 0 ? Math.min((totalSpentPlanCurrency / plan.totalLimit) * 100, 999.99) : 0,
      ),
      alertState: this.mapAlertState(plan.overallAlertState),
      originPlanId: plan.originPlanId ?? null,
    };

    const metadataPlain = this.mapMetadataToPlain(plan.metadata);

    if (Object.keys(metadataPlain).length > 0) {
      summary.metadata = metadataPlain;
    }

    const categories: BudgetAllocationProgressDto[] = plan.categoryAllocations.map((allocation) => {
      const spent = categorySpendMap.get(allocation.categoryId) ?? 0;
      const limit = allocation.limit;

      return {
        id: allocation.categoryId,
        name: categoryNames[allocation.categoryId] ?? null,
        limit: convert(limit),
        spent: convert(spent),
        remaining: convert(Math.max(limit - spent, 0)),
        usagePercentage: this.round(limit > 0 ? Math.min((spent / limit) * 100, 999.99) : 0),
        currency: targetCurrency,
        alertState: this.mapAlertState(allocation.alertState),
      };
    });

    const paymentSources: BudgetAllocationProgressDto[] = plan.paymentSourceAllocations.map((allocation) => {
      const spent = sourceSpendMap.get(allocation.paymentSourceId) ?? 0;
      const limit = allocation.limit;

      return {
        id: allocation.paymentSourceId,
        name: paymentSourceNames[allocation.paymentSourceId] ?? null,
        limit: convert(limit),
        spent: convert(spent),
        remaining: convert(Math.max(limit - spent, 0)),
        usagePercentage: this.round(limit > 0 ? Math.min((spent / limit) * 100, 999.99) : 0),
        currency: targetCurrency,
        alertState: this.mapAlertState(allocation.alertState),
      };
    });

    return {
      summary,
      byCategory: categories,
      byPaymentSource: paymentSources,
    };
  }

  private async aggregatePlanExpenses(plan: BudgetPlanDocument): Promise<{
    summary?: AggregatedSummary[];
    categoryBreakdown?: AggregatedBreakdown[];
    paymentSourceBreakdown?: AggregatedBreakdown[];
  }> {
    const amountInPlanCurrency = {
      $round: [
        {
          $multiply: [
            '$amount',
            {
              $ifNull: [
                {
                  $getField: {
                    field: plan.currency,
                    input: '$exchangeRates',
                  },
                },
                1,
              ],
            },
          ],
        },
        2,
      ],
    };

    const pipeline: PipelineStage[] = [
      {
        $match: {
          userId: plan.userId,
          createdAt: {
            $gte: plan.periodStart,
            $lte: plan.periodEnd,
          },
        },
      },
      {
        $addFields: {
          amountInPlanCurrency,
        },
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalAmount: { $sum: '$amountInPlanCurrency' },
                totalCount: { $sum: 1 },
              },
            },
          ],
          categoryBreakdown: [
            {
              $group: {
                _id: '$categoryId',
                totalAmount: { $sum: '$amountInPlanCurrency' },
                count: { $sum: 1 },
              },
            },
          ],
          paymentSourceBreakdown: [
            {
              $group: {
                _id: '$paymentSourceId',
                totalAmount: { $sum: '$amountInPlanCurrency' },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ];

    const [result] = await this.expenseModel.aggregate(pipeline).allowDiskUse(true).exec();

    return (
      result ?? {
        summary: [],
        categoryBreakdown: [],
        paymentSourceBreakdown: [],
      }
    );
  }

  private normalizeCategoryAllocations(input?: CreateBudgetPlanDto['categoryAllocations']) {
    if (!input?.length) {
      return [];
    }

    const allocationMap = new Map<string, number>();

    for (const allocation of input) {
      if (allocationMap.has(allocation.categoryId)) {
        throw new BadRequestException(`Duplicate category allocation for ${allocation.categoryId}`);
      }

      allocationMap.set(allocation.categoryId, allocation.limit);
    }

    return input.map((allocation) => ({
      categoryId: allocation.categoryId,
      limit: allocation.limit,
      alertState: {},
    }));
  }

  private normalizePaymentSourceAllocations(input?: CreateBudgetPlanDto['paymentSourceAllocations']) {
    if (!input?.length) {
      return [];
    }

    const allocationMap = new Map<string, number>();

    for (const allocation of input) {
      if (allocationMap.has(allocation.paymentSourceId)) {
        throw new BadRequestException(`Duplicate payment source allocation for ${allocation.paymentSourceId}`);
      }

      allocationMap.set(allocation.paymentSourceId, allocation.limit);
    }

    return input.map((allocation) => ({
      paymentSourceId: allocation.paymentSourceId,
      limit: allocation.limit,
      alertState: {},
    }));
  }

  private mapMetadataEntries(entries: CreateBudgetPlanDto['metadata']): Record<string, string> {
    const metadata: Record<string, string> = {};

    if (!entries?.length) {
      return metadata;
    }

    for (const entry of entries) {
      metadata[entry.key] = entry.value;
    }

    return metadata;
  }

  private mapMetadataToPlain(metadata: BudgetPlanDocument['metadata']): Record<string, string> {
    if (!metadata) {
      return {};
    }

    if (metadata instanceof Map) {
      return Object.fromEntries(metadata.entries());
    }

    return { ...metadata };
  }

  private mapAlertState(state: BudgetAlertState | undefined): BudgetPlanSummaryDto['alertState'] {
    if (!state) {
      return { nearLimitNotifiedAt: null, limitExceededNotifiedAt: null };
    }

    return {
      nearLimitNotifiedAt: state.nearLimitNotifiedAt ? new Date(state.nearLimitNotifiedAt).toISOString() : null,
      limitExceededNotifiedAt: state.limitExceededNotifiedAt
        ? new Date(state.limitExceededNotifiedAt).toISOString()
        : null,
    };
  }

  private normalizeDateStart(date: string | Date): Date {
    const instance = new Date(date);

    if (Number.isNaN(instance.getTime())) {
      throw new BadRequestException('Invalid periodStart');
    }

    instance.setUTCHours(0, 0, 0, 0);

    return instance;
  }

  private normalizeDateEnd(date: string | Date): Date {
    const instance = new Date(date);

    if (Number.isNaN(instance.getTime())) {
      throw new BadRequestException('Invalid periodEnd');
    }

    instance.setUTCHours(23, 59, 59, 999);

    return instance;
  }

  private ensureGranularityAlignment(start: Date, end: Date, granularity: AnalyticsTrendGranularity): void {
    switch (granularity) {
      case AnalyticsTrendGranularity.DAY:
        if (!this.isSameDay(start, end)) {
          throw new BadRequestException('Day granularity requires periodStart and periodEnd to be on the same day');
        }

        break;
      case AnalyticsTrendGranularity.WEEK:
        if (this.daysBetween(start, end) > 6) {
          throw new BadRequestException('Week granularity supports periods up to 7 days');
        }

        break;
      case AnalyticsTrendGranularity.MONTH:
        if (start.getUTCFullYear() !== end.getUTCFullYear() || start.getUTCMonth() !== end.getUTCMonth()) {
          throw new BadRequestException('Month granularity requires period to stay within the same month');
        }

        break;
      case AnalyticsTrendGranularity.YEAR:
        if (start.getUTCFullYear() !== end.getUTCFullYear()) {
          throw new BadRequestException('Year granularity requires period to stay within the same year');
        }

        break;
      default:
        throw new BadRequestException('Unsupported granularity');
    }
  }

  private daysBetween(start: Date, end: Date): number {
    const diff = end.getTime() - start.getTime();

    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getUTCFullYear() === b.getUTCFullYear() &&
      a.getUTCMonth() === b.getUTCMonth() &&
      a.getUTCDate() === b.getUTCDate()
    );
  }

  private async archiveActivePlan(userId: string): Promise<void> {
    const existingActive = await this.budgetPlanModel.findOne({ userId, status: BudgetPlanStatus.ACTIVE });

    if (existingActive) {
      existingActive.status = BudgetPlanStatus.ARCHIVED;
      existingActive.archivedAt = new Date();
      await existingActive.save();
    }
  }

  private async buildExchangeRatesSnapshot(currency: CURRENCIES): Promise<Record<CURRENCIES, number>> {
    const ratesResponse = await this.currencyService.getRatesByDate(new Date());
    const normalizedRates = this.normalizeRatesRecord(ratesResponse?.rates ?? {});

    return this.currencyService.recalculateCurrencyRate(currency, { ...normalizedRates });
  }

  private async refreshExchangeRatesSnapshot(currency: CURRENCIES): Promise<Record<CURRENCIES, number>> {
    return this.buildExchangeRatesSnapshot(currency);
  }

  private cloneAllocation<T extends BudgetCategoryAllocation | BudgetPaymentSourceAllocation>(allocation: T): T {
    return {
      ...allocation,
      alertState: {},
    };
  }

  private calculateDefaultPeriodStart(plan: BudgetPlanDocument): string {
    const now = new Date();

    switch (plan.granularity) {
      case AnalyticsTrendGranularity.DAY:
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();

      case AnalyticsTrendGranularity.WEEK: {
        const dayOfWeek = now.getUTCDay() || 7;
        const monday = new Date(now);
        monday.setUTCDate(now.getUTCDate() - (dayOfWeek - 1));
        monday.setUTCHours(0, 0, 0, 0);

        return monday.toISOString();
      }

      case AnalyticsTrendGranularity.MONTH:
        return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
      case AnalyticsTrendGranularity.YEAR:
        return new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).toISOString();
      default:
        return now.toISOString();
    }
  }

  private calculateDefaultPeriodEnd(start: Date, granularity: AnalyticsTrendGranularity): string {
    let end: Date;

    switch (granularity) {
      case AnalyticsTrendGranularity.DAY:
        end = new Date(start);
        break;
      case AnalyticsTrendGranularity.WEEK:
        end = new Date(start);
        end.setUTCDate(start.getUTCDate() + 6);
        break;
      case AnalyticsTrendGranularity.MONTH:
        end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0));
        break;
      case AnalyticsTrendGranularity.YEAR:
        end = new Date(Date.UTC(start.getUTCFullYear(), 11, 31));
        break;
      default:
        end = new Date(start);
    }

    end.setUTCHours(23, 59, 59, 999);

    return end.toISOString();
  }

  private async getConversionMultiplier(plan: BudgetPlanDocument, targetCurrency: CURRENCIES): Promise<number> {
    if (targetCurrency === plan.currency) {
      return 1;
    }

    if (plan.exchangeRatesSnapshot?.[targetCurrency]) {
      return plan.exchangeRatesSnapshot[targetCurrency];
    }

    const refreshedSnapshot = await this.buildExchangeRatesSnapshot(plan.currency);
    plan.exchangeRatesSnapshot = refreshedSnapshot;
    await plan.updateOne({ exchangeRatesSnapshot: refreshedSnapshot });

    return refreshedSnapshot[targetCurrency] ?? 1;
  }

  private normalizeRatesRecord(rates: Record<string, number>): Record<CURRENCIES, number> {
    const normalized: Partial<Record<CURRENCIES, number>> = {};

    for (const currency of Object.values(CURRENCIES)) {
      normalized[currency] = rates[currency] ?? 1;
    }

    return normalized as Record<CURRENCIES, number>;
  }

  private async resolveCategoryNames(ids: string[]): Promise<Record<string, string>> {
    if (!ids.length) {
      return {};
    }

    const uniqueIds = [...new Set(ids)];
    const categories = await this.categoryModel
      .find({ _id: { $in: uniqueIds } })
      .select(['_id', 'title'])
      .lean();

    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[category._id.toString()] = category.title;

      return acc;
    }, {});
  }

  private async resolvePaymentSourceNames(ids: string[]): Promise<Record<string, string>> {
    if (!ids.length) {
      return {};
    }

    const uniqueIds = [...new Set(ids)];
    const paymentSources = await this.paymentSourceModel
      .find({ _id: { $in: uniqueIds } })
      .select(['_id', 'title'])
      .lean();

    return paymentSources.reduce<Record<string, string>>((acc, source) => {
      acc[source._id.toString()] = source.title;

      return acc;
    }, {});
  }

  private doesPlanOverlapQuery(plan: BudgetPlanDocument, query: ExpenseAnalyticsQueryDto): boolean {
    const start = query.createdStartDate ? new Date(query.createdStartDate) : plan.periodStart;
    const end = query.createdEndDate ? new Date(query.createdEndDate) : plan.periodEnd;

    const queryRangeStart = Number.isNaN(start.getTime()) ? plan.periodStart : start;
    const queryRangeEnd = Number.isNaN(end.getTime()) ? plan.periodEnd : end;

    return (
      plan.periodStart.getTime() <= queryRangeEnd.getTime() && plan.periodEnd.getTime() >= queryRangeStart.getTime()
    );
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
