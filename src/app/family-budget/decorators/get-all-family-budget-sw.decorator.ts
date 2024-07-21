import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';

export function GetFamilyBudgetSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all family budgets',
      description: `
            Requires:
            - token in the header`,
    }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: `
            OK: The family budgets have been successfully retrieved.`,
    }),
    ApiNotFoundResponse({
      description: `
            Not Found: No family budgets found.`,
    }),
  );
}
