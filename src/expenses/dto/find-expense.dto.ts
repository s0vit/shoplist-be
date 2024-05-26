import { IsOptional } from 'class-validator';

export class FindExpenseDto {
  @IsOptional()
  createdAt: [Date, Date];

  @IsOptional()
  paymentSourceId: string;

  @IsOptional()
  expensesTypeId: string;

  @IsOptional()
  limit: number;

  @IsOptional()
  skip: number;
}
