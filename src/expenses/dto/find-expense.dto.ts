export class FindExpenseDto {
  createdAt: [Date, Date];
  paymentSourceId: string;
  expensesTypeId: string;
  limit: number;
  skip: number;
}
