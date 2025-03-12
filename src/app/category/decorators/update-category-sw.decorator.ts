import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { CategoryInputDto } from '../dto/category-input.dto';
import { CategoryOutputDto } from '../dto/category-output.dto';
import { CATEGORY_ERROR } from '../constants/category-error.enum';

export function UpdateCategorySwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update a category',
      description: `
        Requires:
        - token in the header,
        - categoryId in Param
        - title in Body
        - color in Body

        Optionally:
        - comments in Body
      `,
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'categoryId',
      type: String,
      required: true,
      description: 'The category id',
    }),
    ApiBody({
      description: 'The category input',
      type: CategoryInputDto,
    }),
    ApiResponse({
      status: 200,
      description: `
      - ok: The category has been successfully updated.`,
      type: CategoryOutputDto,
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
    ApiResponse({
      status: 500,
      description: `
      - Internal Server Error: ${CATEGORY_ERROR.UPDATE_CATEGORY_ERROR}`,
    }),
  );
}
