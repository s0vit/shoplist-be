import { PartialType } from '@nestjs/swagger';
import { CreateBudgetPlanDto } from './create-budget-plan.dto';

export class UpdateBudgetPlanDto extends PartialType(CreateBudgetPlanDto) {}
