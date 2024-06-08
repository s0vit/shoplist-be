import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';

export class PaymentSourceOutputDto {
  @ApiProperty({
    example: '60b4b6b0a9f8b4001f9c4f5b',
    description: 'Payment source id',
    type: String,
  })
  _id: ObjectId;

  @ApiProperty({
    example: 'Bank A',
    description: 'Payment source title',
    type: String,
  })
  title: string;

  @ApiProperty({
    example: 'Comments',
    description: 'Some extra information',
    type: String,
  })
  comments: string;

  @ApiProperty({
    example: '#00fa58',
    description: 'Color of the payment source, used for decoration in the UI',
    type: String,
  })
  color: string;

  @ApiProperty({
    example: new Date(),
    description: 'Creation date',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Last update date',
    type: Date,
  })
  updatedAt: Date;

  @ApiProperty({
    example: '60b4b6b0a9f8b4001f9c4f5b',
    description: 'User id',
    type: String,
  })
  userId: string;
}
