import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { CATEGORY_ERROR } from '../constants/category-error.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CategoryInputDto {
  @ApiProperty({
    example: 'Products',
    description: 'Category name',
    type: String,
    required: true,
  })
  @IsString()
  // ToDo: проверить что вернём ошибка по умолчанию
  @Length(0, 15, { message: CATEGORY_ERROR.TITLE_SHOULD_BE_LESS_THAN_16_CHARACTERS })
  title: string;

  @ApiProperty({
    example: '#00fa58',
    description: 'Color of the category, used for decoration in the UI',
    type: String,
    required: true,
  })
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: CATEGORY_ERROR.COLOR_SHOULD_BE_HEX })
  color: string;

  @ApiProperty({
    example: 'All kinds of products...',
    description: 'A note about the category',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(0, 100, { message: CATEGORY_ERROR.COMMENTS_SHOULD_BE_LESS_THAN_100_CHARACTERS })
  comments?: string;
}
