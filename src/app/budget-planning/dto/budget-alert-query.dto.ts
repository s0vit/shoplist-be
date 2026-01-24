import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional } from 'class-validator';

export class BudgetAlertQueryDto {
  @ApiPropertyOptional({
    description: 'Filters alerts by specific budget plan identifier',
    example: '665f2d9b4a1c6c001fc3aa92',
  })
  @IsOptional()
  @IsMongoId()
  planId?: string;
}
