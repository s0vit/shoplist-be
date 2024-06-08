import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ExpenseOutputDto } from '../dto/expense-output.dto';
import { EXPENSE_ERROR } from '../constants/expense-error.enum';

export function UpdateExpenseSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update Expense by id',
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
      expensesId: The ID of the Expense to update.`,
      type: String,
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: `
      ok: The user Expense successfully updated.`,
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
