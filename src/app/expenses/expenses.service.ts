import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ExpensesInputDto } from './dto/expenses-input.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Expenses, ExpensesDocument } from './models/expenses.model';
import { EXPENSES_ERROR } from './constants/expenses-error.enum';
import { AccessControlService } from '../access-control/access-control.service';
import { ExpensesOutputDto } from './dto/expenses-output.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expenses.name)
    private readonly expensesModel: Model<Expenses>,
    private readonly accessControlService: AccessControlService,
  ) {}

  async create(inputDto: ExpensesInputDto, userId: string): Promise<ExpensesOutputDto> {
    try {
      const newExpansesInstance = new this.expensesModel({
        // ToDo: need write amount in cents to avoid rounding problems
        userId: userId,
        amount: inputDto.amount,
        categoryId: inputDto.categoryId,
        paymentSourceId: inputDto.paymentSourceId,
        comments: inputDto.comments,
      });
      const createdExpanse = await newExpansesInstance.save();
      return createdExpanse.toObject({ versionKey: false });
    } catch (error) {
      throw new HttpException(EXPENSES_ERROR.CREATE_EXPENSE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async getById(expensesId: string, userId: string): Promise<ExpensesOutputDto> {
    const foundExpanse = await this.expensesModel.findById(expensesId);
    if (!foundExpanse) {
      throw new NotFoundException(EXPENSES_ERROR.EXPENSE_NOT_FOUND);
    }
    if (foundExpanse.userId !== userId) {
      throw new UnauthorizedException(EXPENSES_ERROR.ACCESS_DENIED);
    }
    return foundExpanse.toObject({ versionKey: false });
  }
  async getOwn(userId: string): Promise<ExpensesOutputDto[]> {
    const foundExpanse = await this.expensesModel.find({ userId }).select('-__v').lean();
    if (!foundExpanse) {
      throw new NotFoundException(EXPENSES_ERROR.EXPENSE_NOT_FOUND);
    }
    return foundExpanse;
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
  async update(expensesId: string, inputDto: ExpensesInputDto, userId: string): Promise<ExpensesOutputDto> {
    const foundExpanse = await this.expensesModel.findById(expensesId);
    if (!foundExpanse) {
      throw new NotFoundException(EXPENSES_ERROR.EXPENSE_NOT_FOUND);
    }
    if (foundExpanse.userId !== userId) {
      throw new UnauthorizedException(EXPENSES_ERROR.ACCESS_DENIED);
    }
    return this.expensesModel.findByIdAndUpdate(expensesId, inputDto, { new: true }).lean();
  }
  async delete(expensesId: string, userId: string): Promise<ExpensesOutputDto> {
    const expense = await this.expensesModel.findById(expensesId);
    if (!expense) {
      throw new NotFoundException(EXPENSES_ERROR.EXPENSE_NOT_FOUND);
    }
    if (expense.userId !== userId) {
      throw new UnauthorizedException(EXPENSES_ERROR.ACCESS_DENIED);
    }
    try {
      await expense.deleteOne();
      return expense.toObject({ versionKey: false });
    } catch (error) {
      throw new HttpException(EXPENSES_ERROR.DELETE_EXPENSES_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
