import { ExpensesDocument } from '../../expenses/models/expenses.model';
import { Types } from 'mongoose';

export class CreateAccessResponseDto {
  expenses: {
    _id: Types.ObjectId;
    amount: number;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];

  constructor(expensesDocuments: ExpensesDocument[]) {
    this.expenses = expensesDocuments.map((expense) => ({
      _id: expense._id,
      amount: expense.amount,
      categoryId: expense.categoryId,
      createdAt: expense.createdAt,
      updatedAt: expense.updatedAt,
    }));
  }
}
