import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class ActivateBudgetPlanDto {
  @ApiPropertyOptional({
    description: 'Overrides the period start for the re-activated plan',
    example: '2024-08-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  periodStart?: string;

  @ApiPropertyOptional({
    description: 'Overrides the period end for the re-activated plan',
    example: '2024-08-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  periodEnd?: string;
}
