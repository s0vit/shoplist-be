import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsIn, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ExpenseQueryInputDto } from './expense-query-input.dto';
import { CURRENCIES } from '../../../common/interfaces/currencies.enum';

const toArray = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : String(item)))
      .filter((item) => item.length > 0);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return [String(value)];
};

const toBoolean = (value: unknown): boolean | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['true', '1', 'yes', 'y'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'no', 'n'].includes(normalized)) {
      return false;
    }
  }

  return undefined;
};

export enum AnalyticsTrendGranularity {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class ExpenseAnalyticsQueryDto extends ExpenseQueryInputDto {
  @ApiPropertyOptional({
    description: 'Filter expenses by multiple category IDs',
    type: [String],
    example: ['6616f96da226986482597b6c'],
  })
  @IsOptional()
  @IsMongoId({ each: true })
  @Transform(({ value }) => toArray(value))
  categoryIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter expenses by multiple payment source IDs',
    type: [String],
    example: ['6616f96da226986482597b6c'],
  })
  @IsOptional()
  @IsMongoId({ each: true })
  @Transform(({ value }) => toArray(value))
  paymentSourceIds?: string[];

  @ApiPropertyOptional({
    description: 'Filter expenses by source currencies',
    type: [String],
    enum: CURRENCIES,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(CURRENCIES, { each: true })
  @Transform(({ value }) => toArray(value)?.map((item) => item.toUpperCase()))
  currencies?: CURRENCIES[];

  @ApiPropertyOptional({
    description: 'Desired currency for the aggregated amounts',
    enum: CURRENCIES,
    example: CURRENCIES.USD,
  })
  @IsOptional()
  @IsEnum(CURRENCIES)
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  targetCurrency?: CURRENCIES;

  @ApiPropertyOptional({
    description: 'Whether to include only expenses that contain comments',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  hasComments?: boolean;

  @ApiPropertyOptional({
    description: 'Perform a case-insensitive search within comments',
    example: 'подписка',
  })
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @ApiPropertyOptional({
    description: 'Controls the granularity of the time trend data',
    enum: AnalyticsTrendGranularity,
    example: AnalyticsTrendGranularity.MONTH,
  })
  @IsOptional()
  @IsIn(Object.values(AnalyticsTrendGranularity))
  trendGranularity?: AnalyticsTrendGranularity;

  @ApiPropertyOptional({
    description: 'Include AI generated insights based on the aggregated data',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  includeAiAnalysis?: boolean;
}
