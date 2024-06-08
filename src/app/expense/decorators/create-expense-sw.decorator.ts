import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExpenseInputDto } from '../dto/expense-input.dto';
import { ExpenseOutputDto } from '../dto/expense-output.dto';
import { EXPENSE_ERROR } from '../constants/expense-error.enum';

export function CreateExpenseSwDec() {
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
    ApiBody({ type: ExpenseInputDto }),
    ApiResponse({
      status: 200,
      description: `
      ok: The Expense was successfully created.`,
      type: ExpenseOutputDto,
    }),
    ApiResponse({
      status: 400,
      description: `
      Bad Request: ${EXPENSE_ERROR.CREATE_EXPENSE_ERROR}`,
    }),
  );
}
