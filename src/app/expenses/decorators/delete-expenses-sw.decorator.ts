import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { EXPENSES_ERROR } from '../constants/expenses-error.enum';
import { ExpensesOutputDto } from '../dto/expenses-output.dto';

export function DeleteExpensesSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete Expenses by id',
      description: `
      Requires:
      - token in Cookies
      - expensesId in Params`,
    }),
    ApiCookieAuth(),
    ApiParam({
      name: 'expensesId',
      description: `
      expensesId: The ID of the Expenses to delete.`,
      type: String,
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: `
      ok: The user Expenses successfully deleted.`,
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
