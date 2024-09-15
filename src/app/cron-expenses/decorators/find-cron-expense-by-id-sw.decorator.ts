import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CronExpenseOutputDto } from '../dto/cron-expense-output.dto';

export function FindCronExpenseByIdSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Find a cron expense task by ID.',
      description: `
       Requires:
      - token in the header
      - task ID in the URL`,
    }),
    ApiBearerAuth(),
    HttpCode(200),
    ApiResponse({
      status: 200,
      description: `
      ok: The Cron Expense Task was successfully retrieved.`,
      type: CronExpenseOutputDto,
    }),
    ApiResponse({
      status: 404,
      description: `
      Not Found: Cron Expense Task not found.`,
    }),
  );
}
