import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostponedExpenseOutputDto } from '../dto/postponed-expense-output.dto';

export function UpdatePostponedExpenseSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a postponed expense' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'The expense has been successfully updated.',
      type: PostponedExpenseOutputDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Postponed expense not found.',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data or scheduled date is not in future',
    }),
  );
}
