import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ExpensesOutputDto } from '../dto/expenses-output.dto';
import { EXPENSES_ERROR } from '../constants/expenses-error.enum';

export function GetSharedSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get shared Expenses by id',
      description: `
      Get all shared expenses by the ID of the user who given access

      Requires:
      - token in Cookies
      - sharedId in Params`,
    }),
    ApiCookieAuth(),
    ApiParam({
      name: 'sharedId',
      description: `
      sharedId: The ID of the user who given access to shared expenses.`,
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
