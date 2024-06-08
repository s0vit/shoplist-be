import { IsMongoId, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// ToDo: categoryId and paymentSourceId add default value
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
}
