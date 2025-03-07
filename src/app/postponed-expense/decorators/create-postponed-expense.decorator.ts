import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostponedExpenseOutputDto } from '../dto/postponed-expense-output.dto';

export function CreatePostponedExpenseSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new postponed expense' }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'The expense has been successfully created.',
      type: PostponedExpenseOutputDto,
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid input data or scheduled date is not in future',
    }),
  );
}
