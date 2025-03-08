import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostponedExpenseOutputDto } from '../dto/postponed-expense-output.dto';

export function GetAllPostponedExpensesSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all postponed expenses for the current user' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of all postponed expenses.',
      type: [PostponedExpenseOutputDto],
    }),
  );
}
