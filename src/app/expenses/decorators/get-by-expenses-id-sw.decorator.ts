import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { EXPENSES_ERROR } from '../constants/expenses-error.enum';
import { ExpensesOutputDto } from '../dto/expenses-output.dto';

export function GetByExpensesIdSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user Expenses by id',
      description: `
      Requires:
      - token in Cookies
      - expensesId in Params`,
    }),
    ApiCookieAuth(),
    ApiParam({
      name: 'expensesId',
      description: `
      expensesId: The ID of the user Expenses.`,
      type: String,
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: `
      ok: The user Expenses successfully received.`,
      type: ExpensesOutputDto,
    }),
    ApiResponse({
      status: 404,
      description: `
      Bad Request: ${EXPENSES_ERROR.EXPENSE_NOT_FOUND}`,
    }),
    ApiResponse({
      status: 401,
      description: `
      Unauthorized: ${EXPENSES_ERROR.ACCESS_DENIED}`,
    }),
  );
}
