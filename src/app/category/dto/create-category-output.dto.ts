import { ApiProperty } from '@nestjs/swagger';
import { CategoryDocument } from '../models/category.model';

export class CreateCategoryOutputDto {
  @ApiProperty({
    example: '6616f96da226986482597b6c',
    description: 'Category ID',
  })
  categoryId: string;

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

  constructor(category: CategoryDocument) {
    this.categoryId = String(category._id);
    this.title = category.title;
    this.userId = category.userId;
    this.comments = category.comments;
    this.createdAt = category.createdAt;
    this.updatedAt = category.updatedAt;
  }
}
