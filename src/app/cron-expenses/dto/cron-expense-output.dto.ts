import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CURRENCIES } from '../../../common/interfaces/currencies.enum';
import { RECURRENCE_TYPES } from '../constants/RECURRENCE_TYPES';

export class CronExpenseOutputDto {
  @ApiProperty({ description: 'Expense amount', example: 100 })
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: 'Category ID', example: '5f6a0c8b3e0b8f001f8e7e7c' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'Payment source ID', example: '5f6a0c8b3e0b8f001f8e7e7c' })
  @IsString()
  @IsNotEmpty()
  paymentSourceId: string;

  @ApiProperty({ description: 'Comments', example: 'Monthly subscription', required: false })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiProperty({ description: 'Creation date', example: '2023-10-01T00:00:00Z' })
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty({ description: 'Currency', enum: CURRENCIES, example: CURRENCIES.USD })
  @IsEnum(CURRENCIES)
  @IsNotEmpty()
  currency: CURRENCIES;

  @ApiProperty({ description: 'Recurrence type', example: 'monthly' })
  @IsString()
  @IsNotEmpty()
  recurrenceType: RECURRENCE_TYPES;

  @ApiProperty({ description: 'Recurrence end date', example: '2024-10-01T00:00:00Z', required: false })
  @IsDate()
  @IsOptional()
  recurrenceEndDate?: Date;

  @ApiProperty({ description: 'User ID', example: '5f6a0c8b3e0b8f001f8e7e7c' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Cron task ID', example: '5f6a0c8b3e0b8f001f8e7e7c' })
  @IsString()
  @IsNotEmpty()
  _id: string;
}
