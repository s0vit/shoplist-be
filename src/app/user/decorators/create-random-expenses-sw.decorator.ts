import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { USER_ERROR } from '../constants/user-error.enum';
import { QuantityInputDto } from '../dto/quantity-input.dto';

export function CreateRandomExpensesSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create random Expenses',
      description: `
      Requires:
      - token in Cookies
      - quantity in Body`,
    }),
    ApiCookieAuth(),
    ApiBody({ type: QuantityInputDto }),
    ApiResponse({
      status: 200,
      description: `
      - ok: The random expenses created successfully`,
    }),
    ApiResponse({
      status: 404,
      description: `
      - Conflict: ${USER_ERROR.FORBIDDEN}`,
    }),
    ApiResponse({
      status: 500,
      description: `
      - Internal Server Error: ${USER_ERROR.CREATE_EXPENSES_ERROR}`,
    }),
  );
}
