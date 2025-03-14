import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { CategoryOutputDto } from '../dto/category-output.dto';
import { CATEGORY_ERROR } from '../constants/category-error.enum';

export function GetByCategoryIdSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user Category by id',
      description: `
      Requires:
      - token in the header,
      - categoryId in Params`,
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'categoryId',
      description: '#### The Category id',
      type: String,
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: `
      - ok: The user category successfully received.`,
      type: [CategoryOutputDto],
    }),
    ApiResponse({
      status: 400,
      description: `
      - Bad Request: ${CATEGORY_ERROR.INVALID_MONGODB_OBJECT_ID}`,
    }),
    ApiResponse({
      status: 409,
      description: `
      - Conflict: ${CATEGORY_ERROR.CATEGORY_NOT_FOUND}`,
    }),
    ApiResponse({
      status: 401,
      description: `
      - Unauthorized: ${CATEGORY_ERROR.FORBIDDEN}`,
    }),
  );
}
