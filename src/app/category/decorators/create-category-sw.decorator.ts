import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateCategoryInputDto } from '../dto/create-category-input.dto';
import { CreateCategoryOutputDto } from '../dto/create-category-output.dto';

export function CreateCategorySwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create category',
      description: 'Requires a token in cookies and title and userId',
    }),
    ApiBody({ type: CreateCategoryInputDto }),
    ApiCookieAuth(),
    ApiResponse({
      description: 'Categories have been successfully created!',
      type: CreateCategoryOutputDto,
    }),
  );
}
