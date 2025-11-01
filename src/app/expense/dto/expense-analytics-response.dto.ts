import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CURRENCIES } from '../../../common/interfaces/currencies.enum';
import { AnalyticsTrendGranularity } from './expense-analytics-query.dto';

export class ExpenseAnalyticsSummaryDto {
  @ApiProperty({
    description: 'Total amount of expenses within the applied filters in the target currency',
    example: 1250.42,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Number of expenses matched by the filters',
    example: 42,
  })
  totalCount: number;

  @ApiProperty({
    description: 'Average expense amount in the target currency',
    example: 29.77,
  })
  averageAmount: number;

  @ApiProperty({
    description: 'Minimum expense amount in the target currency',
    example: 5.3,
  })
  minAmount: number;

  @ApiProperty({
    description: 'Maximum expense amount in the target currency',
    example: 480.9,
  })
  maxAmount: number;

  @ApiProperty({
    description: 'Currency used for the aggregated values',
    enum: CURRENCIES,
    example: CURRENCIES.USD,
  })
  currency: CURRENCIES;
}

export class ExpenseAnalyticsBreakdownItemDto {
  @ApiProperty({
    description: 'Identifier of the category or payment source',
    example: '6616f96da226986482597b6c',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Resolved name of the entity (if available)',
    example: 'Продукты',
    type: String,
    nullable: true,
  })
  name?: string | null;

  @ApiProperty({
    description: 'Total amount spent for the given entity in the target currency',
    example: 430.75,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Percentage share of the entity relative to the total amount',
    example: 34.5,
  })
  percentage: number;

  @ApiProperty({
    description: 'Number of expenses attributed to the entity',
    example: 12,
  })
  count: number;
}

export class ExpenseAnalyticsTrendPointDto {
  @ApiProperty({
    description: 'Time period label constructed using the requested granularity',
    example: '2024-06',
  })
  period: string;

  @ApiProperty({
    description: 'Aggregated amount for the time period in the target currency',
    example: 215.6,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Average expense amount inside the period',
    example: 26.95,
  })
  averageAmount: number;

  @ApiProperty({
    description: 'Number of expenses within the period',
    example: 8,
  })
  count: number;
}

export class ExpenseAnalyticsAppliedFiltersDto {
  @ApiPropertyOptional({
    description: 'Category filters applied during aggregation',
    type: [String],
  })
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Payment source filters applied during aggregation',
    type: [String],
  })
  paymentSourceIds?: string[];

  @ApiPropertyOptional({
    description: 'Original currencies included in the dataset',
    type: [String],
    enum: CURRENCIES,
  })
  currencies?: CURRENCIES[];

  @ApiPropertyOptional({
    description: 'Date range start used for the dataset (ISO string)',
    example: '2024-05-01T00:00:00.000Z',
    nullable: true,
  })
  createdStartDate?: string | null;

  @ApiPropertyOptional({
    description: 'Date range end used for the dataset (ISO string)',
    example: '2024-05-31T23:59:59.999Z',
    nullable: true,
  })
  createdEndDate?: string | null;

  @ApiPropertyOptional({
    description: 'Lower bound for expense amount filtering in original currency',
    example: 10,
    nullable: true,
  })
  amountStart?: number | null;

  @ApiPropertyOptional({
    description: 'Upper bound for expense amount filtering in original currency',
    example: 500,
    nullable: true,
  })
  amountEnd?: number | null;

  @ApiPropertyOptional({
    description: 'Indicates whether the dataset is limited to expenses with comments',
    example: true,
    nullable: true,
  })
  hasComments?: boolean | null;

  @ApiPropertyOptional({
    description: 'Search term that was applied to comments',
    example: 'подписка',
    nullable: true,
  })
  searchTerm?: string | null;

  @ApiProperty({
    description: 'Granularity used to build the trend timeline',
    enum: AnalyticsTrendGranularity,
    example: AnalyticsTrendGranularity.MONTH,
  })
  trendGranularity: AnalyticsTrendGranularity;

  @ApiProperty({
    description: 'Currency used for aggregated values',
    enum: CURRENCIES,
    example: CURRENCIES.USD,
  })
  targetCurrency: CURRENCIES;
}

export class ExpenseAnalyticsAiInsightDto {
  @ApiProperty({
    description: 'Textual AI generated insight derived from the aggregated data',
    example: '- Самая большая доля расходов пришлась на категорию «Продукты» (35%).',
  })
  summary: string;

  @ApiProperty({
    description: 'Timestamp when the insight was generated',
    example: '2024-06-20T10:15:30.000Z',
  })
  generatedAt: string;

  @ApiPropertyOptional({
    description: 'Model identifier that produced the insight',
    example: 'gemini-2.0-flash-001',
    nullable: true,
  })
  model?: string | null;
}

export class ExpenseAnalyticsResponseDto {
  @ApiProperty({ type: ExpenseAnalyticsSummaryDto })
  summary: ExpenseAnalyticsSummaryDto;

  @ApiProperty({ type: ExpenseAnalyticsBreakdownItemDto, isArray: true })
  byCategory: ExpenseAnalyticsBreakdownItemDto[];

  @ApiProperty({ type: ExpenseAnalyticsBreakdownItemDto, isArray: true })
  byPaymentSource: ExpenseAnalyticsBreakdownItemDto[];

  @ApiProperty({ type: ExpenseAnalyticsTrendPointDto, isArray: true })
  trend: ExpenseAnalyticsTrendPointDto[];

  @ApiProperty({ type: ExpenseAnalyticsAppliedFiltersDto })
  appliedFilters: ExpenseAnalyticsAppliedFiltersDto;

  @ApiPropertyOptional({ type: ExpenseAnalyticsAiInsightDto })
  aiInsights?: ExpenseAnalyticsAiInsightDto;
}
