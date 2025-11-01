import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Expense } from './models/expense.model';
import { Category, CategoryDocument } from '../category/models/category.model';
import { PaymentSource, PaymentSourceDocument } from '../payment-source/models/payment-source.model';
import { UserConfig, UserConfigDocument } from '../user-config/model/user-config.model';
import { AnalyticsTrendGranularity, ExpenseAnalyticsQueryDto } from './dto/expense-analytics-query.dto';
import {
  ExpenseAnalyticsAiInsightDto,
  ExpenseAnalyticsAppliedFiltersDto,
  ExpenseAnalyticsBreakdownItemDto,
  ExpenseAnalyticsResponseDto,
  ExpenseAnalyticsSummaryDto,
  ExpenseAnalyticsTrendPointDto,
} from './dto/expense-analytics-response.dto';
import { CURRENCIES } from '../../common/interfaces/currencies.enum';

type RawAggregationSummary = {
  totalAmount?: number;
  totalCount?: number;
  averageAmount?: number;
  minAmount?: number;
  maxAmount?: number;
};

type RawAggregationBreakdown = {
  _id: string | null;
  totalAmount: number;
  count: number;
};

type RawAggregationTimeline = {
  _id: string;
  totalAmount: number;
  averageAmount: number;
  count: number;
};

@Injectable()
export class ExpenseAnalyticsService {
  private readonly logger = new Logger(ExpenseAnalyticsService.name);
  private readonly modelId = 'gemini-2.0-flash-001';
  private readonly endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelId}:generateContent`;

  constructor(
    @InjectModel(Expense.name) private readonly expenseModel: Model<Expense>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(PaymentSource.name) private readonly paymentSourceModel: Model<PaymentSourceDocument>,
    @InjectModel(UserConfig.name) private readonly userConfigModel: Model<UserConfigDocument>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getAnalytics(userId: string, query: ExpenseAnalyticsQueryDto): Promise<ExpenseAnalyticsResponseDto> {
    const targetCurrency = await this.resolveTargetCurrency(userId, query.targetCurrency);
    const granularity = query.trendGranularity ?? AnalyticsTrendGranularity.MONTH;

    const matchStage = this.buildMatchStage(userId, query);
    const pipeline = this.buildAggregationPipeline(matchStage, targetCurrency, granularity);

    const aggregation = await this.aggregateExpenses(pipeline);

    const summary = this.buildSummary(aggregation.summary?.[0], targetCurrency);

    const categoryIds = (aggregation.categoryBreakdown ?? [])
      .map((item) => item._id)
      .filter((id): id is string => Boolean(id));
    const paymentSourceIds = (aggregation.paymentSourceBreakdown ?? [])
      .map((item) => item._id)
      .filter((id): id is string => Boolean(id));

    const [categoryNames, paymentSourceNames] = await Promise.all([
      this.resolveCategoryNames(categoryIds),
      this.resolvePaymentSourceNames(paymentSourceIds),
    ]);

    const byCategory = this.buildBreakdown(aggregation.categoryBreakdown ?? [], summary.totalAmount, categoryNames);
    const byPaymentSource = this.buildBreakdown(
      aggregation.paymentSourceBreakdown ?? [],
      summary.totalAmount,
      paymentSourceNames,
    );
    const trend = this.buildTrend(aggregation.timeline ?? [], granularity);

    const appliedFilters = this.buildAppliedFilters(query, matchStage, targetCurrency, granularity);

    let aiInsights: ExpenseAnalyticsAiInsightDto | undefined;

    if (query.includeAiAnalysis && summary.totalCount > 0) {
      aiInsights = await this.generateAiInsights(summary, byCategory, byPaymentSource, trend, targetCurrency);
    }

    return {
      summary,
      byCategory,
      byPaymentSource,
      trend,
      appliedFilters,
      aiInsights,
    };
  }

  private async aggregateExpenses(pipeline: PipelineStage[]): Promise<{
    summary?: RawAggregationSummary[];
    categoryBreakdown?: RawAggregationBreakdown[];
    paymentSourceBreakdown?: RawAggregationBreakdown[];
    timeline?: RawAggregationTimeline[];
  }> {
    const [result] = (await this.expenseModel.aggregate(pipeline).allowDiskUse(true).exec()) ?? [];

    return (
      result ?? {
        summary: [],
        categoryBreakdown: [],
        paymentSourceBreakdown: [],
        timeline: [],
      }
    );
  }

  private buildMatchStage(userId: string, query: ExpenseAnalyticsQueryDto): Record<string, unknown> {
    const match: Record<string, unknown> = { userId };
    const andConditions: Record<string, unknown>[] = [];

    const now = new Date();
    const defaultStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const defaultEnd = now;

    const resolvedStart = query.createdStartDate ? new Date(query.createdStartDate) : defaultStart;
    const resolvedEnd = query.createdEndDate ? new Date(query.createdEndDate) : defaultEnd;

    if (!Number.isNaN(resolvedStart.getTime()) || !Number.isNaN(resolvedEnd.getTime())) {
      const createdAt: Record<string, Date> = {};

      if (!Number.isNaN(resolvedStart.getTime())) {
        createdAt.$gte = resolvedStart;
      }

      if (!Number.isNaN(resolvedEnd.getTime())) {
        createdAt.$lte = resolvedEnd;
      }

      andConditions.push({ createdAt });
    }

    const singleCategoryId = query.categoryId;
    const categorySet = new Set<string>(query.categoryIds ?? []);

    if (singleCategoryId) {
      categorySet.add(singleCategoryId);
    }

    if (categorySet.size === 1) {
      match.categoryId = [...categorySet][0];
    } else if (categorySet.size > 1) {
      match.categoryId = { $in: [...categorySet] };
    }

    const singlePaymentSourceId = query.paymentSourceId;
    const paymentSourceSet = new Set<string>(query.paymentSourceIds ?? []);

    if (singlePaymentSourceId) {
      paymentSourceSet.add(singlePaymentSourceId);
    }

    if (paymentSourceSet.size === 1) {
      match.paymentSourceId = [...paymentSourceSet][0];
    } else if (paymentSourceSet.size > 1) {
      match.paymentSourceId = { $in: [...paymentSourceSet] };
    }

    if (typeof query.amountStart === 'number' || typeof query.amountEnd === 'number') {
      const amount: Record<string, number> = {};

      if (typeof query.amountStart === 'number') {
        amount.$gte = query.amountStart;
      }

      if (typeof query.amountEnd === 'number') {
        amount.$lte = query.amountEnd;
      }

      match.amount = amount;
    }

    if (query.currencies && query.currencies.length > 0) {
      match.currency = { $in: query.currencies };
    }

    if (typeof query.hasComments === 'boolean') {
      if (query.hasComments) {
        andConditions.push({
          comments: {
            $exists: true,
            $type: 'string',
            $ne: '',
          },
        });
      } else {
        andConditions.push({
          $or: [{ comments: { $exists: false } }, { comments: { $eq: '' } }, { comments: { $type: 'null' } }],
        });
      }
    }

    if (query.searchTerm) {
      andConditions.push({
        comments: {
          $regex: query.searchTerm,
          $options: 'i',
        },
      });
    }

    if (andConditions.length) {
      match.$and = andConditions;
    }

    return match;
  }

  private buildAggregationPipeline(
    matchStage: Record<string, unknown>,
    targetCurrency: CURRENCIES,
    granularity: AnalyticsTrendGranularity,
  ): PipelineStage[] {
    const amountInTarget = {
      $round: [
        {
          $multiply: [
            '$amount',
            {
              $ifNull: [
                {
                  $getField: {
                    field: targetCurrency,
                    input: '$exchangeRates',
                  },
                },
                0,
              ],
            },
          ],
        },
        2,
      ],
    };

    return [
      { $match: matchStage },
      {
        $addFields: {
          amountInTarget,
          trendKey: this.buildTrendKeyExpression(granularity),
        },
      },
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalAmount: { $sum: '$amountInTarget' },
                totalCount: { $sum: 1 },
                averageAmount: { $avg: '$amountInTarget' },
                minAmount: { $min: '$amountInTarget' },
                maxAmount: { $max: '$amountInTarget' },
              },
            },
          ],
          categoryBreakdown: [
            {
              $group: {
                _id: '$categoryId',
                totalAmount: { $sum: '$amountInTarget' },
                count: { $sum: 1 },
              },
            },
            {
              $sort: {
                totalAmount: -1,
              },
            },
          ],
          paymentSourceBreakdown: [
            {
              $group: {
                _id: '$paymentSourceId',
                totalAmount: { $sum: '$amountInTarget' },
                count: { $sum: 1 },
              },
            },
            {
              $sort: {
                totalAmount: -1,
              },
            },
          ],
          timeline: [
            {
              $group: {
                _id: '$trendKey',
                totalAmount: { $sum: '$amountInTarget' },
                averageAmount: { $avg: '$amountInTarget' },
                count: { $sum: 1 },
              },
            },
            {
              $sort: {
                _id: 1,
              },
            },
          ],
        },
      },
    ];
  }

  private buildTrendKeyExpression(granularity: AnalyticsTrendGranularity): Record<string, unknown> {
    switch (granularity) {
      case AnalyticsTrendGranularity.DAY:
        return {
          $dateToString: {
            date: '$createdAt',
            format: '%Y-%m-%d',
            timezone: 'UTC',
          },
        };
      case AnalyticsTrendGranularity.WEEK:
        return {
          $concat: [
            {
              $toString: {
                $isoWeekYear: '$createdAt',
              },
            },
            '-W',
            {
              $toString: {
                $isoWeek: '$createdAt',
              },
            },
          ],
        };
      case AnalyticsTrendGranularity.YEAR:
        return {
          $dateToString: {
            date: '$createdAt',
            format: '%Y',
            timezone: 'UTC',
          },
        };
      case AnalyticsTrendGranularity.MONTH:
      default:
        return {
          $dateToString: {
            date: '$createdAt',
            format: '%Y-%m',
            timezone: 'UTC',
          },
        };
    }
  }

  private buildSummary(raw: RawAggregationSummary | undefined, currency: CURRENCIES): ExpenseAnalyticsSummaryDto {
    if (!raw) {
      return {
        totalAmount: 0,
        totalCount: 0,
        averageAmount: 0,
        minAmount: 0,
        maxAmount: 0,
        currency,
      };
    }

    return {
      totalAmount: this.round(raw.totalAmount ?? 0),
      totalCount: raw.totalCount ?? 0,
      averageAmount: this.round(raw.averageAmount ?? 0),
      minAmount: this.round(raw.minAmount ?? 0),
      maxAmount: this.round(raw.maxAmount ?? 0),
      currency,
    };
  }

  private buildBreakdown(
    raw: RawAggregationBreakdown[],
    totalAmount: number,
    names: Record<string, string>,
  ): ExpenseAnalyticsBreakdownItemDto[] {
    if (!raw || raw.length === 0) {
      return [];
    }

    return raw.map((item) => {
      const percentage = totalAmount > 0 ? this.round((item.totalAmount / totalAmount) * 100) : 0;
      const id = item._id ?? 'unknown';

      return {
        id,
        name: names[id] ?? null,
        totalAmount: this.round(item.totalAmount),
        percentage,
        count: item.count,
      };
    });
  }

  private buildTrend(
    raw: RawAggregationTimeline[],
    granularity: AnalyticsTrendGranularity,
  ): ExpenseAnalyticsTrendPointDto[] {
    if (!raw || raw.length === 0) {
      return [];
    }

    return raw.map((item) => ({
      period: item._id,
      totalAmount: this.round(item.totalAmount),
      averageAmount: this.round(item.averageAmount),
      count: item.count,
    }));
  }

  private buildAppliedFilters(
    query: ExpenseAnalyticsQueryDto,
    matchStage: Record<string, unknown>,
    targetCurrency: CURRENCIES,
    granularity: AnalyticsTrendGranularity,
  ): ExpenseAnalyticsAppliedFiltersDto {
    const categoryIds = new Set<string>();

    if (query.categoryId) {
      categoryIds.add(query.categoryId);
    }

    (query.categoryIds ?? []).forEach((id) => categoryIds.add(id));

    const paymentSourceIds = new Set<string>();

    if (query.paymentSourceId) {
      paymentSourceIds.add(query.paymentSourceId);
    }

    (query.paymentSourceIds ?? []).forEach((id) => paymentSourceIds.add(id));

    const createdAtCondition = Array.isArray(matchStage.$and)
      ? (matchStage.$and as Record<string, unknown>[]).find(
          (condition): condition is { createdAt: { $gte?: Date; $lte?: Date } } =>
            typeof condition === 'object' && condition !== null && 'createdAt' in condition,
        )
      : undefined;

    const createdAtRange = createdAtCondition?.createdAt;

    return {
      categoryIds: categoryIds.size ? [...categoryIds] : undefined,
      paymentSourceIds: paymentSourceIds.size ? [...paymentSourceIds] : undefined,
      currencies: query.currencies,
      createdStartDate: createdAtRange?.$gte?.toISOString() ?? null,
      createdEndDate: createdAtRange?.$lte?.toISOString() ?? null,
      amountStart: typeof query.amountStart === 'number' ? query.amountStart : null,
      amountEnd: typeof query.amountEnd === 'number' ? query.amountEnd : null,
      hasComments: typeof query.hasComments === 'boolean' ? query.hasComments : null,
      searchTerm: query.searchTerm ?? null,
      trendGranularity: granularity,
      targetCurrency,
    };
  }

  private async resolveCategoryNames(ids: string[]): Promise<Record<string, string>> {
    if (!ids.length) {
      return {};
    }

    const objectIds = ids.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));

    if (!objectIds.length) {
      return {};
    }

    const categories = await this.categoryModel
      .find({ _id: { $in: objectIds } })
      .select(['title'])
      .lean();

    return categories.reduce<Record<string, string>>((acc, category) => {
      acc[(category._id as unknown as Types.ObjectId).toString()] = category.title;

      return acc;
    }, {});
  }

  private async resolvePaymentSourceNames(ids: string[]): Promise<Record<string, string>> {
    if (!ids.length) {
      return {};
    }

    const objectIds = ids.filter((id) => Types.ObjectId.isValid(id)).map((id) => new Types.ObjectId(id));

    if (!objectIds.length) {
      return {};
    }

    const paymentSources = await this.paymentSourceModel
      .find({ _id: { $in: objectIds } })
      .select(['title'])
      .lean();

    return paymentSources.reduce<Record<string, string>>((acc, source) => {
      const key = (source._id as unknown as Types.ObjectId).toString();
      acc[key] = source.title;

      return acc;
    }, {});
  }

  private async resolveTargetCurrency(userId: string, override?: CURRENCIES): Promise<CURRENCIES> {
    if (override && Object.values(CURRENCIES).includes(override)) {
      return override;
    }

    const config = await this.userConfigModel.findOne({ userId }).select(['currency']).lean();
    const preferred = config?.currency as CURRENCIES | undefined;

    if (preferred && Object.values(CURRENCIES).includes(preferred)) {
      return preferred;
    }

    return CURRENCIES.USD;
  }

  private async generateAiInsights(
    summary: ExpenseAnalyticsSummaryDto,
    categories: ExpenseAnalyticsBreakdownItemDto[],
    paymentSources: ExpenseAnalyticsBreakdownItemDto[],
    trend: ExpenseAnalyticsTrendPointDto[],
    targetCurrency: CURRENCIES,
  ): Promise<ExpenseAnalyticsAiInsightDto | undefined> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not configured. Skipping AI analytics generation.');

      return undefined;
    }

    const prompt = this.buildAiPrompt(summary, categories, paymentSources, trend, targetCurrency);

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.endpoint,
          {
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'text/plain',
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            timeout: 10000,
          },
        ),
      );

      const insightText = this.extractCandidateText(response?.data);

      if (!insightText) {
        this.logger.warn('Gemini response did not contain analyzable text.');

        return undefined;
      }

      return {
        summary: insightText.trim(),
        generatedAt: new Date().toISOString(),
        model: this.modelId,
      };
    } catch (error) {
      const err = error as Error & { response?: { status?: number; data?: unknown } };
      this.logger.error(`Failed to generate AI analytics (status: ${err.response?.status ?? 'unknown'})`, err.message);

      return undefined;
    }
  }

  private buildAiPrompt(
    summary: ExpenseAnalyticsSummaryDto,
    categories: ExpenseAnalyticsBreakdownItemDto[],
    paymentSources: ExpenseAnalyticsBreakdownItemDto[],
    trend: ExpenseAnalyticsTrendPointDto[],
    targetCurrency: CURRENCIES,
  ): string {
    const topCategories = categories
      .slice(0, 5)
      .map(
        (item, index) =>
          `${index + 1}. ${item.name ?? 'Без названия'} — ${item.totalAmount.toFixed(
            2,
          )} ${targetCurrency} (${item.percentage.toFixed(2)}%), транзакций: ${item.count}`,
      );

    const topSources = paymentSources
      .slice(0, 5)
      .map(
        (item, index) =>
          `${index + 1}. ${item.name ?? 'Без названия'} — ${item.totalAmount.toFixed(
            2,
          )} ${targetCurrency} (${item.percentage.toFixed(2)}%), транзакций: ${item.count}`,
      );

    const trendLines = trend.map(
      (point) =>
        `${point.period}: сумма ${point.totalAmount.toFixed(
          2,
        )} ${targetCurrency}, средний чек ${point.averageAmount.toFixed(2)}, операций ${point.count}`,
    );

    return [
      'Ты — дружелюбный персональный финансовый аналитик.',
      'По аггрегированным данным ниже сделай 3-4 практичных наблюдения и сформулируй 1 рекомендацию.',
      'Излагай по-русски, компактно, маркированными пунктами (каждый пункт на новой строке, начинай с "- ").',
      `Данные в валюте ${targetCurrency}:`,
      `• Общая сумма: ${summary.totalAmount.toFixed(2)}`,
      `• Количество операций: ${summary.totalCount}`,
      `• Средний чек: ${summary.averageAmount.toFixed(2)}`,
      `• Минимальный чек: ${summary.minAmount.toFixed(2)}`,
      `• Максимальный чек: ${summary.maxAmount.toFixed(2)}`,
      topCategories.length ? `Категории (топ 5):\n${topCategories.join('\n')}` : 'Категории: нет данных.',
      topSources.length ? `Источники оплаты (топ 5):\n${topSources.join('\n')}` : 'Источники оплаты: нет данных.',
      trendLines.length ? `Динамика:\n${trendLines.join('\n')}` : 'Динамика: нет данных.',
      'Не повторяйся, избегай общих фраз, фокусируйся на выводах и конкретных шагах.',
    ].join('\n');
  }

  private extractCandidateText(responseData: unknown): string | undefined {
    if (
      typeof responseData === 'object' &&
      responseData !== null &&
      'candidates' in responseData &&
      Array.isArray((responseData as Record<string, unknown>)['candidates'])
    ) {
      const candidate = (responseData as { candidates: Array<Record<string, unknown>> }).candidates[0];
      const content = candidate?.content as { parts?: Array<{ text?: string }> } | undefined;
      const parts = content?.parts;

      if (Array.isArray(parts) && parts.length > 0) {
        const textPart = parts.find((part) => typeof part?.text === 'string');

        if (textPart?.text) {
          return textPart.text;
        }
      }
    }

    return undefined;
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
