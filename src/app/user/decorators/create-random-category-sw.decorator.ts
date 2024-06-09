import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateDataInputDto } from '../dto/create-data-input.dto';
import { USER_ERROR } from '../constants/user-error.enum';

export function CreateRandomCategorySwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create categories and payment Sources',
      description: `
      Requires:
      - token in Cookies
      - categories in Body
      - paymentSources in Body`,
    }),
    ApiCookieAuth(),
    ApiBody({ type: CreateDataInputDto }),
    ApiResponse({
      status: 200,
      description: `
      - ok: The category and payment source were created successfully`,
    }),
    ApiResponse({
      status: 404,
      description: `
      - Conflict: ${USER_ERROR.CATEGORY_OR_PAYMENT_SOURCE_ALREADY_EXIST}`,
    }),
    ApiResponse({
      status: 500,
      description: `
      - Internal Server Error: ${USER_ERROR.CREATE_CATEGORY_AND_PAYMENT_SOURCE_ERROR}`,
    }),
  );
}
