import { IsNumber, IsOptional, IsString, Length, Matches } from 'class-validator';
import { CATEGORY_ERROR } from '../constants/category-error.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryInputDto {
  @ApiProperty({
    example: 'Products',
    description: 'Category name',
    required: true,
  })
  @IsString()
  @Length(1, 30)
  title: string;

  @ApiProperty({
    example: '#00fa58',
    description: 'Color of the category, used for decoration in the UI',
    required: true,
  })
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: CATEGORY_ERROR.COLOR_SHOULD_BE_HEX })
  color: string;

  @ApiProperty({
    example: 'All kinds of products...',
    description: 'A note about the category',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  comments?: string;

  @ApiProperty({
    example: 1,
    description: 'Order of the category for drag and drop functionality',
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  order?: number;
}
