import { IsDateString, IsMongoId, IsOptional, IsPositive } from 'class-validator';

export class ExpenseQueryInputDto {
  @IsOptional()
  @IsDateString()
  createdStartDate?: string;

  @IsOptional()
  @IsDateString()
  createdEndDate?: string;

  @IsOptional()
  @IsPositive()
  amountStart?: number;

  @IsOptional()
  @IsPositive()
  amountEnd?: number;

  @IsOptional()
  @IsMongoId()
  paymentSourceId?: string;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @IsPositive()
  limit?: number;

  @IsOptional()
  @IsPositive()
  skip?: number;
}
