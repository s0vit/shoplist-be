import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ExpensesInputDto } from './dto/expenses-input.dto';
import { Model } from 'mongoose';
import { FindExpenseDto } from './dto/find-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { ERROR_TEXTS } from './constants/error-texts.enum';
import { Expenses, ExpensesDocument } from './models/expenses.model';

@Injectable()
export class ExpensesService {
  constructor(@InjectModel(Expenses.name) private readonly expensesModel: Model<Expenses>) {}

  async create(expense: ExpensesInputDto): Promise<ExpensesDocument> {
    const newExpansesInstance = new this.expensesModel({
      amount: expense.amount,
      expensesTypeId: expense.expensesTypeId,
      paymentSourceId: expense.paymentSourceId,
      userId: 'userId', //TODO find a way to add userId to the request
      comments: expense.comments,
    });
    const createdExpanse = await newExpansesInstance.save();
    return this.expensesModel.findById(createdExpanse._id).lean();
  }

  async get(id: string): Promise<ExpensesDocument> {
    const foundExpanse = await this.expensesModel.findById(id);
    if (!foundExpanse) {
      throw new NotFoundException(ERROR_TEXTS.EXPENSE_NOT_FOUND);
    }
    return foundExpanse;
  }

  async delete(id: string): Promise<ExpensesDocument> {
    const expense = await this.expensesModel.findById(id);
    if (!expense) {
      throw new NotFoundException(ERROR_TEXTS.EXPENSE_NOT_FOUND);
    }
    return this.expensesModel.findByIdAndDelete(id);
  }

  async patch(id: string, expense: ExpensesInputDto): Promise<ExpensesDocument> {
    const foundExpanse = await this.expensesModel.findById(id);
    if (!foundExpanse) {
      throw new NotFoundException(ERROR_TEXTS.EXPENSE_NOT_FOUND);
    }
    return this.expensesModel.findByIdAndUpdate(id, expense, { new: true }).lean();
  }

  async find(dto: FindExpenseDto): Promise<ExpensesDocument[]> {
    //check if the dto.createdAt is an array of two Dates or is undefined and throw an error if it is not
    if (dto?.createdAt && dto.createdAt.length !== 2) {
      throw new BadRequestException(ERROR_TEXTS.INVALID_DATE_RANGE);
    }
    return this.expensesModel
      .find({
        createdAt: { $gte: dto?.createdAt?.[0], $lte: dto?.createdAt?.[1] },
        paymentSourceId: dto?.paymentSourceId,
        expensesTypeId: dto?.expensesTypeId,
      })
      .limit(dto.limit)
      .skip(dto.skip)
      .lean();
  }
}
