import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostponedExpenseOutputDto } from '../dto/postponed-expense-output.dto';

export function GetOnePostponedExpenseSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a specific postponed expense by ID' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'The postponed expense has been found.',
      type: PostponedExpenseOutputDto,
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Postponed expense not found.',
    }),
  );
}
