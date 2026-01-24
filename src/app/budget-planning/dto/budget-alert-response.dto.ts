import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CURRENCIES } from '../../../common/interfaces/currencies.enum';
import { BudgetAlertScope, BudgetAlertType } from '../models/budget-alert.model';

export class BudgetAlertResponseDto {
  @ApiProperty({
    description: 'Identifier of the alert',
    example: '665f3a481a7a26002672b11f',
  })
  id: string;

  @ApiProperty({
    description: 'Related budget plan id',
    example: '665f2d9b4a1c6c001fc3aa92',
  })
  budgetPlanId: string;

  @ApiProperty({
    description: 'Scope of the alert',
    enum: BudgetAlertScope,
    example: BudgetAlertScope.CATEGORY,
  })
  scope: BudgetAlertScope;

  @ApiPropertyOptional({
    description: 'Identifier of the category or payment source when scope is not overall',
    example: '6616f96da226986482597b6c',
    nullable: true,
  })
  scopeRefId?: string | null;

  @ApiProperty({
    description: 'Alert type',
    enum: BudgetAlertType,
    example: BudgetAlertType.NEAR_LIMIT,
  })
  type: BudgetAlertType;

  @ApiProperty({
    description: 'Actual amount spent when alert was triggered',
    example: 710,
  })
  spentAmount: number;

  @ApiProperty({
    description: 'Configured limit for the scope',
    example: 1000,
  })
  limitAmount: number;

  @ApiProperty({
    description: 'Usage percentage for the scope',
    example: 71,
  })
  percentage: number;

  @ApiProperty({
    description: 'Currency of the plan at the moment of alert trigger',
    enum: CURRENCIES,
    example: CURRENCIES.USD,
  })
  currency: CURRENCIES;

  @ApiPropertyOptional({
    description: 'Expense identifier that triggered the alert if available',
    example: '665f3a481a7a26002672b11c',
    nullable: true,
  })
  expenseId?: string | null;

  @ApiProperty({
    description: 'Timestamp when alert was triggered',
    example: '2024-07-20T10:15:00.000Z',
  })
  triggeredAt: string;
}
