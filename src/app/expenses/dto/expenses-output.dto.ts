import { ApiProperty } from '@nestjs/swagger';

export class ExpensesOutputDto {
  @ApiProperty({
    example: '6616f96da226986482597b6c',
    description: 'Unique identifier of the expense.',
  })
  _id: string;

  @ApiProperty({
    example: '15',
    description: 'Amount of the expense.',
  })
  amount: number;

  @ApiProperty({
    example: '6616f96da226986482597b6c',
    description: 'User ID.',
  })
  userId: string;

  @ApiProperty({
    example: '6616f96da226986482597b6c',
    description: 'Category ID.',
  })
  categoryId: string;

  @ApiProperty({
    example: '6616f96da226986482597b6c',
    description: 'Payment source ID.',
  })
  paymentSourceId: string;

  @ApiProperty({
    example: 'Product purchase',
    description: 'Comments for the expense.',
  })
  comments?: string;

  @ApiProperty({
    example: '2024-06-08T09:04:50.592Z',
    description: 'Date created the expense.',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-06-08T09:04:50.592Z',
    description: 'Date updated the expense.',
  })
  updatedAt: Date;
}
