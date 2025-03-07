import { ApiProperty } from '@nestjs/swagger';
import { CURRENCIES } from '../../../common/interfaces/currencies.enum';

export class PostponedExpenseOutputDto {
  @ApiProperty({
    example: '6616f96da226986482597b6c',
    description: 'Unique identifier of the postponed expense',
  })
  _id: string;

  @ApiProperty({
    example: 15,
    description: 'Amount of the expense',
  })
  amount: number;

  @ApiProperty({
    example: '6616f96da226986482597b6c',
    description: 'Category ID',
  })
  categoryId: string;

  @ApiProperty({
    example: '6616f96da226986482597b6c',
    description: 'Payment source ID',
  })
  paymentSourceId: string;

  @ApiProperty({
    example: 'Product purchase',
    description: 'Comments for the expense',
    required: false,
  })
  comments?: string;

  @ApiProperty({
    example: 'USD',
    description: 'Currency of the expense',
    enum: CURRENCIES,
  })
  currency: CURRENCIES;

  @ApiProperty({
    example: '2024-06-08T09:04:50.592Z',
    description: 'Date when the expense should be processed',
  })
  scheduledDate: Date;

  @ApiProperty({
    example: '6616f96da226986482597b6c',
    description: 'ID of the user who created the expense',
  })
  userId: string;

  @ApiProperty({
    example: '2024-03-08T09:04:50.592Z',
    description: 'Date when the expense was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-03-08T09:04:50.592Z',
    description: 'Date when the expense was last updated',
  })
  updatedAt: Date;
}
