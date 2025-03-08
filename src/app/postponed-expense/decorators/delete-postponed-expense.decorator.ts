import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostponedExpenseOutputDto } from '../dto/postponed-expense-output.dto';

export function DeletePostponedExpenseSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete a postponed expense' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'The expense has been successfully deleted.',
      type: PostponedExpenseOutputDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Postponed expense not found.',
    }),
  );
}
