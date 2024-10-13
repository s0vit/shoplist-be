import { ApiProperty } from '@nestjs/swagger';

export class CategoryOutputDto {
  @ApiProperty({
    example: '6616f96da226986482597b6c',
    description: 'Category ID',
  })
  _id: string;

  @ApiProperty({
    example: 'Products',
    description: 'Category Title',
  })
  title: string;

  @ApiProperty({
    example: '6616f96da226986482597b6c',
    description: 'User ID',
  })
  userId: string;

  @ApiProperty({
    example: '#d03abf',
    description: 'Category color',
  })
  color: string;

  @ApiProperty({
    example: 'All kinds of products...',
    description: 'A note about the category',
  })
  comments: string;

  @ApiProperty({
    example: '2021-09-01T00:00:00.000Z',
    description: 'Date of creation',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2021-09-01T00:00:00.000Z',
    description: 'Date of last update',
  })
  updatedAt: Date;
}
