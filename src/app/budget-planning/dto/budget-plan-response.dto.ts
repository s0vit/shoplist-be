import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CURRENCIES } from '../../../common/interfaces/currencies.enum';
import { AnalyticsTrendGranularity } from '../../expense/dto/expense-analytics-query.dto';
import { BudgetPlanStatus } from '../models/budget-plan.model';

export class BudgetAlertStateDto {
  @ApiPropertyOptional({
    description: 'Timestamp of the notification that 70% of the limit was reached',
    example: '2024-07-15T09:12:00.000Z',
    nullable: true,
  })
  nearLimitNotifiedAt?: string | null;

  @ApiPropertyOptional({
    description: 'Timestamp of the notification that the limit was exceeded',
    example: '2024-07-20T11:05:12.000Z',
    nullable: true,
  })
  limitExceededNotifiedAt?: string | null;
}

export class BudgetAllocationProgressDto {
  @ApiProperty({
    description: 'Identifier of the category or payment source allocation',
    example: '6616f96da226986482597b6c',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Human readable name, resolved when available',
    example: 'Карта Tinkoff Black',
    nullable: true,
  })
  name?: string | null;

  @ApiProperty({
    description: 'Planned limit for the allocation in the plan currency',
    example: 500,
  })
  limit: number;

  @ApiProperty({
    description: 'Amount already spent in the same currency',
    example: 420,
  })
  spent: number;

  @ApiProperty({
    description: 'Remaining amount before the limit is hit',
    example: 80,
  })
  remaining: number;

  @ApiProperty({
    description: 'Usage percentage relative to the limit',
    example: 84,
  })
  usagePercentage: number;

  @ApiProperty({
    description: 'Currency of the allocation metrics',
    enum: CURRENCIES,
  })
  currency: CURRENCIES;

  @ApiPropertyOptional({ type: () => BudgetAlertStateDto })
  alertState?: BudgetAlertStateDto;
}

export class BudgetPlanSummaryDto {
  @ApiProperty({
    description: 'Identifier of the budget plan',
    example: '665f2d9b4a1c6c001fc3aa92',
  })
  id: string;

  @ApiProperty({
    description: 'Current status of the plan',
    enum: BudgetPlanStatus,
    example: BudgetPlanStatus.ACTIVE,
  })
  status: BudgetPlanStatus;

  @ApiProperty({
    description: 'Name of the plan',
    example: 'Июль 2024 — семейный бюджет',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Optional description of context or adjustments',
    example: 'Включает отпуск и подготовку к школе',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    description: 'Total limit for the plan',
    example: 1500,
  })
  totalLimit: number;

  @ApiProperty({
    description: 'Currency in which the plan is defined',
    enum: CURRENCIES,
  })
  currency: CURRENCIES;

  @ApiProperty({
    description: 'Date when the plan period starts',
    example: '2024-07-01T00:00:00.000Z',
  })
  periodStart: string;

  @ApiProperty({
    description: 'Date when the plan period ends',
    example: '2024-07-31T23:59:59.999Z',
  })
  periodEnd: string;

  @ApiProperty({
    description: 'Granularity selected for the plan',
    enum: AnalyticsTrendGranularity,
    example: AnalyticsTrendGranularity.MONTH,
  })
  granularity: AnalyticsTrendGranularity;

  @ApiProperty({
    description: 'Total amount spent within the period',
    example: 980,
  })
  spent: number;

  @ApiProperty({
    description: 'Amount still available before the limit is exceeded',
    example: 520,
  })
  remaining: number;

  @ApiProperty({
    description: 'Usage percentage relative to the total limit',
    example: 65.33,
  })
  usagePercentage: number;

  @ApiPropertyOptional({ type: () => BudgetAlertStateDto })
  alertState?: BudgetAlertStateDto;

  @ApiPropertyOptional({
    description: 'Identifier of the plan that served as a template',
    example: '6620454f79376ee6cbdf1d55',
    nullable: true,
  })
  originPlanId?: string | null;

  @ApiPropertyOptional({
    description: 'Metadata key-value pairs useful for exports',
    additionalProperties: true,
    nullable: true,
  })
  metadata?: Record<string, string>;
}

export class BudgetPlanProgressDto {
  @ApiProperty({ type: () => BudgetPlanSummaryDto })
  summary: BudgetPlanSummaryDto;

  @ApiProperty({
    description: 'Per-category progress items',
    type: () => [BudgetAllocationProgressDto],
  })
  byCategory: BudgetAllocationProgressDto[];

  @ApiProperty({
    description: 'Per payment source progress items',
    type: () => [BudgetAllocationProgressDto],
  })
  byPaymentSource: BudgetAllocationProgressDto[];
}

export class BudgetPlanResponseDto extends BudgetPlanProgressDto {}
