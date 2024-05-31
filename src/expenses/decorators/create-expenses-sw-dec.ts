import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExpensesInputDto } from '../dto/expenses-input.dto';
import { ExpensesResponseDto } from '../dto/expenses-response.dto';

export function CreateExpensesSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new expense.',
      description:
        'Requires a token in cookies and a body with amount, categoryId. Optionally, you can add paymentSourceId and comments.',
    }),
    ApiBody({ type: ExpensesInputDto }),
    ApiCookieAuth('accessToken'),
    ApiResponse({
      status: 200,
      description: 'The Expense successfully created.',
      type: ExpensesResponseDto,
    }),
    HttpCode(200),
  );
}
