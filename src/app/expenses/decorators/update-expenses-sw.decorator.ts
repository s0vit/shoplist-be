import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ExpensesOutputDto } from '../dto/expenses-output.dto';
import { EXPENSES_ERROR } from '../constants/expenses-error.enum';

export function UpdateExpensesSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update Expenses by id',
      description: `
      Requires:
      - token in Cookies
      - expensesId in Params
      - amount in Body
      - categoryId in Body
      - paymentSourceId in Body

      Optionally:
      - comments in Body
      - createdAt in Body
      - updatedAt in Body
      `,
    }),
    ApiCookieAuth(),
    ApiParam({
      name: 'expensesId',
      description: `
      expensesId: The ID of the Expenses to update.`,
      type: String,
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: `
      ok: The user Expenses successfully updated.`,
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
