import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ExpenseOutputDto } from '../dto/expense-output.dto';
import { EXPENSE_ERROR } from '../constants/expense-error.enum';

export function GetExpenseByIdsSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get expenses by ids',
      description: `
        Requires:
        - a token in the header
        - ids in the body`,
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Get expenses by ids response',
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
