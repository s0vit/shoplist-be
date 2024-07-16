import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam } from '@nestjs/swagger';
import { FamilyBudget } from '../models/family-budget.model';

export function GetFamilyBudgetByIdSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get family budget by ID',
      description: `
      Requires:
      - token in the header,
      - family budget ID in Params`,
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: `
      The ID of the family budget.`,
      type: String,
      required: true,
    }),
    ApiOkResponse({
      description: `
      OK: The family budget has been successfully retrieved.`,
      type: FamilyBudget,
    }),
    ApiNotFoundResponse({
      description: `
      Not Found: The family budget with the given ID was not found.`,
    }),
  );
}
