import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoryInputDto } from '../dto/category-input.dto';
import { CategoryInputResponseDto } from '../dto/category-input-response.dto';

export function CreateCategorySwaggerDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create category',
      description: 'Requires a token in cookies and title and userId',
    }),
    ApiBody({ type: CategoryInputDto }),
    ApiCookieAuth('accessToken'),
    ApiResponse({
      description: 'Categories have been successfully created!',
      type: CategoryInputResponseDto,
    }),
  );
}
