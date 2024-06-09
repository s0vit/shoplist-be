import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { ExpenseOutputDto } from '../dto/expense-output.dto';
import { EXPENSE_ERROR } from '../constants/expense-error.enum';

export function GetSharedSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get shared Expenses by id',
      description: `
      Get all shared expenses by the ID of the user who given access

      Requires:
      - token in the header,
      - sharedId in Params`,
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'sharedId',
      description: `
      sharedId: The ID of the user who given access to shared expenses.`,
      type: String,
      required: true,
    }),
    ApiResponse({
      status: 200,
      description: `
      ok: The user Expenses successfully received.`,
      type: ExpenseOutputDto,
    }),
    ApiResponse({
      status: 404,
      description: `
      Bad Request: ${EXPENSE_ERROR.EXPENSE_NOT_FOUND}`,
    }),
    ApiResponse({
      status: 401,
      description: `
      Unauthorized: ${EXPENSE_ERROR.ACCESS_DENIED}`,
    }),
  );
}
