import { PartialType } from '@nestjs/mapped-types';
import { CreateFamilyBudgetDto } from './family-budget-input.dto';

export class UpdateFamilyBudgetDto extends PartialType(CreateFamilyBudgetDto) {}
