import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ExpenseOutputDto } from '../dto/expense-output.dto';
import { EXPENSE_ERROR } from '../constants/expense-error.enum';

export function GetByCategorySwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get expenses by category',
      description: `
        Requires:
        - a token in the header
        - category in the params`,
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Get expenses by category response',
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
