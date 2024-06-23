import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ExpenseInputDto } from './dto/expense-input.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Expense, ExpensesDocument } from './models/expense.model';
import { EXPENSE_ERROR } from './constants/expense-error.enum';
import { AccessControlService } from '../access-control/access-control.service';
import { ExpenseOutputDto } from './dto/expense-output.dto';
import { ExpenseQueryInputDto } from './dto/expense-query-input.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name)
    private readonly expensesModel: Model<Expense>,
    private readonly accessControlService: AccessControlService,
  ) {}

  async create(inputDto: ExpenseInputDto, userId: string): Promise<ExpenseOutputDto> {
    try {
      const newExpansesInstance = new this.expensesModel({
        // ToDo: need write amount in cents to avoid rounding problems
        userId: userId,
        amount: inputDto.amount,
        categoryId: inputDto.categoryId,
        paymentSourceId: inputDto.paymentSourceId,
        comments: inputDto.comments,
        createdAt: inputDto.createdAt,
      });
      const createdExpanse = await newExpansesInstance.save();

      return createdExpanse.toObject({ versionKey: false });
    } catch (error) {
      throw new HttpException(EXPENSE_ERROR.CREATE_EXPENSE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async getById(expensesId: string, userId: string): Promise<ExpenseOutputDto> {
    const foundExpanse = await this.expensesModel.findById(expensesId);

    if (!foundExpanse) {
      throw new NotFoundException(EXPENSE_ERROR.EXPENSE_NOT_FOUND);
    }

    if (foundExpanse.userId !== userId) {
      throw new UnauthorizedException(EXPENSE_ERROR.ACCESS_DENIED);
    }

    return foundExpanse.toObject({ versionKey: false });
  }
  async getOwn(userId: string, queryInputDto?: ExpenseQueryInputDto): Promise<ExpenseOutputDto[]> {
    const query = { userId };
    if (queryInputDto?.paymentSourceId) query['paymentSourceId'] = queryInputDto.paymentSourceId;
    if (queryInputDto?.categoryId) query['categoryId'] = queryInputDto.categoryId;

    if (queryInputDto?.createdStartDate || queryInputDto?.createdEndDate) {
      query['createdAt'] = {};
      if (queryInputDto?.createdStartDate) query['createdAt'].$gte = queryInputDto.createdStartDate;
      if (queryInputDto?.createdEndDate) query['createdAt'].$lte = queryInputDto.createdEndDate;
    }

    if (queryInputDto?.amountStart || queryInputDto?.amountEnd) {
      query['amount'] = {};
      if (queryInputDto?.amountStart) query['amount'].$gte = queryInputDto.amountStart;
      if (queryInputDto?.amountEnd) query['amount'].$lte = queryInputDto.amountEnd;
    }

    const foundExpanse = await this.expensesModel
      .find(query)
      .skip(queryInputDto?.skip || 0)
      .limit(queryInputDto?.limit || 100)
      .select('-__v')
      .lean();

    if (!foundExpanse) {
      throw new NotFoundException(EXPENSE_ERROR.EXPENSE_NOT_FOUND);
    }

    return foundExpanse;
  }
  async getSharedExpenses(sharedUserId: string, currentUserId: string): Promise<ExpensesDocument[]> {
    if (currentUserId === sharedUserId) {
      throw new ForbiddenException(EXPENSE_ERROR.GET_OWN_EXPENSE);
    }

    const accessControlAllowed = await this.accessControlService._getAllowedExpensesId(sharedUserId, currentUserId);

    if (!accessControlAllowed) {
      throw new ForbiddenException(EXPENSE_ERROR.ACCESS_DENIED);
    }

    try {
      return this.expensesModel
        .find({ _id: { $in: accessControlAllowed } })
        .select('-__v')
        .lean();
    } catch (error) {
      throw new HttpException(EXPENSE_ERROR.GET_SHARED_EXPENSE, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async update(expensesId: string, inputDto: ExpenseInputDto, userId: string): Promise<ExpenseOutputDto> {
    const foundExpanse = await this.expensesModel.findById(expensesId);

    if (!foundExpanse) {
      throw new NotFoundException(EXPENSE_ERROR.EXPENSE_NOT_FOUND);
    }

    if (foundExpanse.userId !== userId) {
      throw new UnauthorizedException(EXPENSE_ERROR.ACCESS_DENIED);
    }

    return this.expensesModel.findByIdAndUpdate(expensesId, inputDto, { new: true }).lean();
  }
  async delete(expensesId: string, userId: string): Promise<ExpenseOutputDto> {
    const expense = await this.expensesModel.findById(expensesId);

    if (!expense) {
      throw new NotFoundException(EXPENSE_ERROR.EXPENSE_NOT_FOUND);
    }

    if (expense.userId !== userId) {
      throw new UnauthorizedException(EXPENSE_ERROR.ACCESS_DENIED);
    }

    try {
      await expense.deleteOne();

      return expense.toObject({ versionKey: false });
    } catch (error) {
      throw new HttpException(EXPENSE_ERROR.DELETE_EXPENSE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
