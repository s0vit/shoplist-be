import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function DeleteCronExpenseSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete an existing cron expense task.',
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
      ok: The Cron Expense Task was successfully deleted.`,
    }),
    ApiResponse({
      status: 404,
      description: `
      Not Found: Cron Expense Task not found.`,
    }),
  );
}
