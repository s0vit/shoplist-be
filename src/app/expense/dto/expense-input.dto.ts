import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { CURRENCIES } from '../../../common/interfaces/currencies.enum';
import { Types } from 'mongoose';

export class ExpenseInputDto {
  @ApiProperty({
    example: '15',
    description: 'Amount of the expense',
  })
  @IsPositive()
  amount: number;

  @ApiProperty({
    example: '6616f96da226986482597b6c',
    description: 'Category ID',
  })
  @IsMongoId()
  categoryId: string;

  @ApiProperty({
    example: '6616f96da226986482597b6c',
    description: 'Payment source ID',
  })
  @IsMongoId()
  paymentSourceId: string;

  @ApiProperty({
    example: 'Product purchase',
    description: 'Comments for the expense',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  comments?: string;

  @ApiProperty({
    example: 'USD',
    description: 'Currency of the expense',
  })
  @IsString()
  @Length(3, 3)
  currency: CURRENCIES;

  @ApiProperty({
    example: '2024-06-08T09:04:50.592Z',
    description: 'Date created the expense.',
    required: false,
  })
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({
    example: '2024-06-08T09:04:50.592Z',
    description: 'Date updated the expense.',
    required: false,
  })
  @IsOptional()
  updatedAt?: Date;

  @ApiProperty({
    example: '60c72b2f9b1e8e1f88f4e1f4',
    description: 'Family budget ID',
    required: false,
  })
  @IsOptional()
  @IsMongoId()
  familyBudgetId?: Types.ObjectId;
}
