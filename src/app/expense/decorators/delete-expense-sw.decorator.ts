import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { EXPENSE_ERROR } from '../constants/expense-error.enum';
import { ExpenseOutputDto } from '../dto/expense-output.dto';

export function DeleteExpenseSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete Expense by id',
      description: `
      Requires:
      - token in the header
      - expenseId in Params`,
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'expenseId',
      description: `
      expenseId: The ID of the Expense to delete.`,
      type: String,
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: `
      ok: The user Expense successfully deleted.`,
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
