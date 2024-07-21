import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ExpenseOutputDto } from '../dto/expense-output.dto';

export function GetExpenseByFamilyBudgetSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get expenses by family budget ID',
      description: `
      Requires:
      - token in the header,
      - familyBudgetId in Params`,
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'familyBudgetId',
      description: `
      The ID of the family budget.`,
      type: String,
      required: true,
    }),
    ApiOkResponse({
      description: `
      OK: The expenses have been successfully retrieved.`,
      type: [ExpenseOutputDto],
    }),
    ApiNotFoundResponse({
      description: `
      Not Found: No expenses found for the given family budget ID.`,
    }),
    ApiUnauthorizedResponse({
      description: `
      Unauthorized: Access denied.`,
    }),
  );
}
