import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { AnalyticsTrendGranularity } from '../../expense/dto/expense-analytics-query.dto';
import { CURRENCIES } from '../../../common/interfaces/currencies.enum';

export class BudgetPlanMetadataEntryDto {
  @ApiProperty({
    description: 'Metadata key, useful for exports or integration identifiers',
    example: 'notionPageId',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 120)
  key: string;

  @ApiProperty({
    description: 'Metadata value associated with the key',
    example: 'dcbf4368-0c34-4ad3-94d7-5d2a7f6eb51b',
  })
  @IsString()
  @Length(0, 300)
  value: string;
}

export class BudgetCategoryAllocationInputDto {
  @ApiProperty({
    description: 'Identifier of the expense category',
    example: '6616f96da226986482597b6c',
  })
  @IsMongoId()
  categoryId: string;

  @ApiProperty({
    description: 'Planned spending limit for the category in the plan currency',
    example: 300,
  })
  @IsPositive()
  limit: number;
}

export class BudgetPaymentSourceAllocationInputDto {
  @ApiProperty({
    description: 'Identifier of the payment source',
    example: '6616f96da226986482597b6c',
  })
  @IsMongoId()
  paymentSourceId: string;

  @ApiProperty({
    description: 'Planned spending limit for the payment source in the plan currency',
    example: 500,
  })
  @IsPositive()
  limit: number;
}

export class CreateBudgetPlanDto {
  @ApiPropertyOptional({
    description: 'Display title of the budget plan',
    example: 'Июль 2024 — базовый план',
  })
  @IsOptional()
  @IsString()
  @Length(0, 120)
  title?: string;

  @ApiPropertyOptional({
    description: 'Optional description to explain budgeting assumptions',
    example: 'Включает отпуск и сезонные траты',
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @ApiProperty({
    description: 'Spending limit for the entire plan in the selected currency',
    example: 1200,
  })
  @IsPositive()
  totalLimit: number;

  @ApiProperty({
    description: 'Currency used for the budget plan and allocations',
    enum: CURRENCIES,
    example: CURRENCIES.USD,
  })
  @IsEnum(CURRENCIES)
  currency: CURRENCIES;

  @ApiProperty({
    description: 'Date when the budgeting period starts (inclusive)',
    example: '2024-07-01T00:00:00.000Z',
  })
  @IsDateString()
  periodStart: string;

  @ApiProperty({
    description: 'Date when the budgeting period ends (inclusive)',
    example: '2024-07-31T23:59:59.999Z',
  })
  @IsDateString()
  periodEnd: string;

  @ApiProperty({
    description: 'Time granularity that matches analytics views',
    enum: AnalyticsTrendGranularity,
    example: AnalyticsTrendGranularity.MONTH,
  })
  @IsEnum(AnalyticsTrendGranularity)
  granularity: AnalyticsTrendGranularity;

  @ApiPropertyOptional({
    description: 'Optional per-category allocations',
    type: () => [BudgetCategoryAllocationInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetCategoryAllocationInputDto)
  categoryAllocations?: BudgetCategoryAllocationInputDto[];

  @ApiPropertyOptional({
    description: 'Optional per payment source allocations',
    type: () => [BudgetPaymentSourceAllocationInputDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetPaymentSourceAllocationInputDto)
  paymentSourceAllocations?: BudgetPaymentSourceAllocationInputDto[];

  @ApiPropertyOptional({
    description: 'Arbitrary metadata entries to help with exports or integrations',
    type: () => [BudgetPlanMetadataEntryDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BudgetPlanMetadataEntryDto)
  metadata?: BudgetPlanMetadataEntryDto[];
}
