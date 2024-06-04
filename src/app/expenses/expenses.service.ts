import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ExpensesInputDto } from './dto/expenses-input.dto';
import { Model } from 'mongoose';
import { FindExpenseInputDto } from './dto/find-expense-input.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Expenses, ExpensesDocument } from './models/expenses.model';
import { EXPENSES_ERROR } from './constants/expenses-error.enum';
import { JsonWebTokenError } from '@nestjs/jwt';
import { AccessControlService } from '../../access-control/access-control.service';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expenses.name)
    private readonly expensesModel: Model<Expenses>,
    private readonly accessControlService: AccessControlService,
  ) {}

  async create(expense: ExpensesInputDto, userId: string): Promise<ExpensesDocument> {
    try {
      const newExpansesInstance = new this.expensesModel({
        amount: expense.amount,
        categoryId: expense.categoryId,
        paymentSourceId: expense.paymentSourceId,
        userId: userId,
        comments: expense.comments,
      });
      const createdExpanse = await newExpansesInstance.save();
      return createdExpanse.toObject({ versionKey: false });
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(EXPENSES_ERROR.CREATE_EXPENSE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async getById(id: string): Promise<ExpensesDocument> {
    const foundExpanse = await this.expensesModel.findById(id);
    if (!foundExpanse) {
      throw new NotFoundException(EXPENSES_ERROR.EXPENSE_NOT_FOUND);
    }
    return foundExpanse;
  }
  async getOwn(userId: string): Promise<ExpensesDocument[]> {
    return this.expensesModel.find({ userId }).select('-__v').lean();
  }
  async getSharedExpenses(sharedUserId: string, currentUserId: string): Promise<ExpensesDocument[]> {
    if (currentUserId === sharedUserId) {
      throw new ForbiddenException(EXPENSES_ERROR.GET_OWN_EXPENSES);
    }
    const accessControlAllowed = await this.accessControlService._getAllowedExpensesId(sharedUserId, currentUserId);
    if (!accessControlAllowed) {
      throw new ForbiddenException(EXPENSES_ERROR.ACCESS_DENIED);
    }
    try {
      return this.expensesModel
        .find({ _id: { $in: accessControlAllowed } })
        .select('-__v')
        .lean();
    } catch (error) {
      throw new HttpException(EXPENSES_ERROR.GET_SHARED_EXPENSES, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async delete(id: string): Promise<ExpensesDocument> {
    const expense = await this.expensesModel.findById(id);
    if (!expense) {
      throw new NotFoundException(EXPENSES_ERROR.EXPENSE_NOT_FOUND);
    }
    return this.expensesModel.findByIdAndDelete(id);
  }
  async patch(id: string, expense: ExpensesInputDto): Promise<ExpensesDocument> {
    const foundExpanse = await this.expensesModel.findById(id);
    if (!foundExpanse) {
      throw new NotFoundException(EXPENSES_ERROR.EXPENSE_NOT_FOUND);
    }
    return this.expensesModel.findByIdAndUpdate(id, expense, { new: true }).lean();
  }
  async find(dto: FindExpenseInputDto): Promise<ExpensesDocument[]> {
    //check if the dto.createdAt is an array of two Dates or is undefined and throw an error if it is not
    return this.expensesModel
      .find({
        createdAt: { $gte: dto?.createdStartDate, $lte: dto?.createdEndDate },
        paymentSourceId: dto?.paymentSourceId,
        expensesTypeId: dto?.expensesTypeId,
      })
      .limit(dto.limit)
      .skip(dto.skip)
      .lean();
  }
}
