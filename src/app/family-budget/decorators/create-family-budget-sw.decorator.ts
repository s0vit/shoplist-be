import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { FamilyBudget } from '../models/family-budget.model';
import { CreateFamilyBudgetDto } from '../dto/family-budget-input.dto';

export function CreateFamilyBudgetSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create a new family budget',
      description: `
      Requires:
      - token in the header,
      - body with family budget data`,
    }),
    ApiBody({
      description: `
        The family budget to be created.`,
      type: CreateFamilyBudgetDto,
    }),
    ApiBearerAuth(),
    ApiCreatedResponse({
      description: `
      Created: The family budget has been successfully created.`,
      type: FamilyBudget,
    }),
    ApiBadRequestResponse({
      description: `
      Bad Request: Invalid data provided.`,
    }),
  );
}
