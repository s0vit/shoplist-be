import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ExpenseOutputDto } from '../dto/expense-output.dto';
import { EXPENSE_ERROR } from '../constants/expense-error.enum';

export function GetByPaymentSourceSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get expenses by payment source',
      description: `
        Requires:
        - a token in the header
        - payment source in the params`,
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'All expenses by payment source',
      type: [ExpenseOutputDto],
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 401,
      description: EXPENSE_ERROR.ACCESS_DENIED,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}
