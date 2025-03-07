import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsMongoId, IsNumber, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { CURRENCIES } from '../../../common/interfaces/currencies.enum';

export class PostponedExpenseInputDto {
  @ApiProperty({
    example: 15,
    description: 'Amount of the expense',
  })
  @IsPositive()
  @IsNumber()
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
    enum: CURRENCIES,
  })
  @IsEnum(CURRENCIES)
  currency: CURRENCIES;

  @ApiProperty({
    example: '2024-06-08T09:04:50.592Z',
    description: 'Date when the expense should be processed',
  })
  @IsDate()
  scheduledDate: Date;
}
