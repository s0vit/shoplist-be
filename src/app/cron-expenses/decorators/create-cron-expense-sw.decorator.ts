import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CronExpenseInputDto } from '../dto/cron-expense-input.dto';
import { CronExpenseOutputDto } from '../dto/cron-expense-output.dto';

export function CreateCronExpenseSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new cron expense task.',
      description: `
       Requires:
      - token in the header
      - amount in Body
      - categoryId in Body
      - paymentSourceId in Body
      - currency in Body
      - recurrenceType in Body

      Optionally:
      - comments in Body
      - createdAt in Body
      - recurrenceEndDate in Body`,
    }),
    ApiBearerAuth(),
    HttpCode(200),
    ApiBody({ type: CronExpenseInputDto }),
    ApiResponse({
      status: 200,
      description: `
      ok: The Cron Expense Task was successfully created.`,
      type: CronExpenseOutputDto,
    }),
    ApiResponse({
      status: 400,
      description: `
      Bad Request: Invalid input data.`,
    }),
  );
}
