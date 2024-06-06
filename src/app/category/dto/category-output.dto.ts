import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';

export class CategoryOutputDto {
  @ApiProperty({
    example: '6616f96da226986482597b6c',
    description: 'Category ID',
    type: String,
  })
  _id: ObjectId | string;

  @ApiProperty({
    example: 'Products',
    description: 'Category Title',
    type: String,
  })
  title: string;

  @ApiProperty({
    example: '6616f96da226986482597b6c',
    description: 'User ID',
    type: String,
  })
  userId: string;

  @ApiProperty({
    example: 'All kinds of products...',
    description: 'A note about the category',
    type: String,
  })
  comments: string;

  @ApiProperty({
    example: '2021-09-01T00:00:00.000Z',
    description: 'Date of creation',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    example: '2021-09-01T00:00:00.000Z',
    description: 'Date of last update',
    type: Date,
  })
  updatedAt: Date;
}
