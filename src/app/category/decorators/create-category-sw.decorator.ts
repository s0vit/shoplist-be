import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoryInputDto } from '../dto/category-input.dto';
import { CategoryOutputDto } from '../dto/category-output.dto';
import { CATEGORY_ERROR } from '../constants/category-error.enum';

export function CreateCategorySwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create category',
      description: `
      Requires:
      - token in Cookies
      - title in Body
      - color in Body
      
      Optionally:
      - comments in Body`,
    }),
    ApiBody({ type: CategoryInputDto }),
    ApiCookieAuth(),
    ApiResponse({
      status: 200,
      description: `
      - ok: The category was successfully created`,
      type: CategoryOutputDto,
    }),
    ApiResponse({
      status: 409,
      description: `
      - Conflict: ${CATEGORY_ERROR.CATEGORY_ALREADY_EXIST}`,
    }),
    ApiResponse({
      status: 500,
      description: `
      - Internal Server Error: ${CATEGORY_ERROR.CREATE_CATEGORY_ERROR}`,
    }),
  );
}
