import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExpensesInputDto } from '../dto/expenses-input.dto';
import { ExpensesOutputDto } from '../dto/expenses-output.dto';

export function CreateExpensesSwDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new expense.',
      description:
        'Requires a token in cookies and a body with amount, categoryId. Optionally, you can add paymentSourceId and comments.',
    }),
    ApiBody({ type: ExpensesInputDto }),
    ApiCookieAuth(),
    ApiResponse({
      status: 200,
      description: 'The Expense successfully created.',
      type: ExpensesOutputDto,
    }),
    HttpCode(200),
  );
}
