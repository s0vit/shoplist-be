import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { EXPENSE_ERROR } from '../constants/expense-error.enum';
import { ExpenseOutputDto } from '../dto/expense-output.dto';

export function GetByExpenseIdSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user Expense by id',
      description: `
      Requires:
      - token in Cookies
      - expensesId in Params`,
    }),
    ApiCookieAuth(),
    ApiParam({
      name: 'expenseId',
      description: `
      expenseId: The ID of the user Expense.`,
      type: String,
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: `
      ok: The user Expense successfully received.`,
      type: ExpenseOutputDto,
    }),
    ApiResponse({
      status: 404,
      description: `
      Bad Request: ${EXPENSE_ERROR.EXPENSE_NOT_FOUND}`,
    }),
    ApiResponse({
      status: 401,
      description: `
      Unauthorized: ${EXPENSE_ERROR.ACCESS_DENIED}`,
    }),
  );
}
