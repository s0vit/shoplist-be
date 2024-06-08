import { IsDateString, IsMongoId, IsOptional, IsPositive } from 'class-validator';

export class ExpenseQueryInputDto {
  @IsOptional()
  @IsDateString()
  createdStartDate?: string;

  @IsOptional()
  @IsDateString()
  createdEndDate?: string;

  @IsOptional()
  @IsMongoId()
  paymentSourceId?: string;

  @IsOptional()
  @IsMongoId()
  expensesTypeId?: string;

  @IsOptional()
  @IsPositive()
  limit?: number;

  @IsOptional()
  @IsPositive()
  skip?: number;
}
