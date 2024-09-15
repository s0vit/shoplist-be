import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CronExpenseOutputDto } from '../dto/cron-expense-output.dto';

export function FindCronExpenseSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Find all cron expense tasks.',
      description: `
       Requires:
      - token in the header`,
    }),
    ApiBearerAuth(),
    HttpCode(200),
    ApiResponse({
      status: 200,
      description: `
      ok: The Cron Expense Tasks were successfully retrieved.`,
      type: [CronExpenseOutputDto],
    }),
  );
}
