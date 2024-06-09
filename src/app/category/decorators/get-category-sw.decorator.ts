import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoryOutputDto } from '../dto/category-output.dto';
import { CATEGORY_ERROR } from '../constants/category-error.enum';

export function GetCategorySwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all users categories',
      description: `
      Requires:
      - token in the header`,
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: `
      ok: The users categories successfully received.
      `,
      type: [CategoryOutputDto],
    }),
    ApiResponse({
      status: 500,
      description: `
      - Internal Server Error: ${CATEGORY_ERROR.GET_CATEGORY_ERROR}`,
    }),
  );
}
