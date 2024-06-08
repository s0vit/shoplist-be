import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExpensesInputDto } from '../dto/expenses-input.dto';
import { ExpensesOutputDto } from '../dto/expenses-output.dto';
import { EXPENSES_ERROR } from '../constants/expenses-error.enum';

export function CreateExpensesSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new expense.',
      description: `
       Requires:
      - token in Cookies
      - amount in Body
      - categoryId in Body
      - paymentSourceId in Body

      Optionally:
      - comments in Body`,
    }),
    ApiCookieAuth(),
    HttpCode(200),
    ApiBody({ type: ExpensesInputDto }),
    ApiResponse({
      status: 200,
      description: `
      ok: The Expense was successfully created.`,
      type: ExpensesOutputDto,
    }),
    ApiResponse({
      status: 400,
      description: `
      Bad Request: ${EXPENSES_ERROR.CREATE_EXPENSE_ERROR}`,
    }),
  );
}
