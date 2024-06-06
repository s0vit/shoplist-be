import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { CategoryOutputDto } from '../dto/category-output.dto';
import { CATEGORY_ERROR } from '../constants/category-error.enum';

export function DeleteCategorySwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete user category by id',
      description: `
        Requires:
        - token in Cookies
        - categoryId in Param
      `,
    }),
    ApiCookieAuth(),
    ApiParam({
      name: 'categoryId',
      type: String,
      required: true,
      description: 'The category source id',
    }),
    ApiResponse({
      status: 200,
      description: `
      - ok: The user category successfully deleted.`,
      type: CategoryOutputDto,
    }),
    ApiResponse({
      status: 409,
      description: `
      - Conflict: ${CATEGORY_ERROR.CATEGORY_NOT_FOUND}`,
    }),
    ApiResponse({
      status: 400,
      description: `
      - Bad Request: ${CATEGORY_ERROR.INVALID_MONGODB_OBJECT_ID}`,
    }),
    ApiResponse({
      status: 401,
      description: `
      - Unauthorized: ${CATEGORY_ERROR.FORBIDDEN}`,
    }),
    ApiResponse({
      status: 500,
      description: `
      - Internal Server Error: ${CATEGORY_ERROR.DELETE_CATEGORY_ERROR}`,
    }),
  );
}
