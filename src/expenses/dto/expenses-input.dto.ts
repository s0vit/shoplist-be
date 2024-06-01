import { IsMongoId, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { EXPENSES_ERROR } from '../constants/expenses-error.enum';
import { ApiProperty } from '@nestjs/swagger';
// ToDo: categoryId and paymentSourceId add default value
export class ExpensesInputDto {
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
  @IsOptional()
  @IsMongoId()
  paymentSourceId?: string;

  @ApiProperty({
    example: 'Product purchase',
    description: 'Comments for the expense',
  })
  @IsOptional()
  @IsString({ message: EXPENSES_ERROR.COMMENTS_SHOULD_BE_A_STRING })
  @Length(0, 100, { message: EXPENSES_ERROR.COMMENTS_SHOULD_BE_LESS_THAN_100_CHARACTERS })
  comments?: string;
}
