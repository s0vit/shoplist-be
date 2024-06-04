import { IsOptional, IsString, Length } from 'class-validator';
import { CATEGORY_ERROR } from '../constants/category-error.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryInputDto {
  @ApiProperty({
    example: 'Products',
    description: 'Category name',
  })
  @IsString({ message: CATEGORY_ERROR.TITLE_SHOULD_BE_A_STRING })
  @Length(0, 15, { message: CATEGORY_ERROR.TITLE_SHOULD_BE_LESS_THAN_16_CHARACTERS })
  title: string;

  @ApiProperty({
    example: 'All kinds of products...',
    description: 'A note about the category',
  })
  @IsOptional()
  @Length(0, 100, { message: CATEGORY_ERROR.COMMENTS_SHOULD_BE_LESS_THAN_100_CHARACTERS })
  comments?: string;
}
