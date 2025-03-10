import { ApiProperty } from '@nestjs/swagger';

export class PaymentSourceOutputDto {
  @ApiProperty({
    example: '60b4b6b0a9f8b4001f9c4f5b',
    description: 'Payment source id',
  })
  _id: string;

  @ApiProperty({
    example: 'Bank A',
    description: 'Payment source title',
  })
  title: string;

  @ApiProperty({
    example: 'Comments',
    description: 'Some extra information',
  })
  comments: string;

  @ApiProperty({
    example: '#00fa58',
    description: 'Color of the payment source, used for decoration in the UI',
  })
  color: string;

  @ApiProperty({
    example: 1,
    description: 'Order of the payment source for drag and drop functionality',
  })
  order: number;

  @ApiProperty({
    example: new Date(),
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Last update date',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '60b4b6b0a9f8b4001f9c4f5b',
    description: 'User id',
  })
  userId: string;
}
