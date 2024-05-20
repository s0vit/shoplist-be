import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ExpensesInputDto } from './dto/expenses-input.dto';
import { Model } from 'mongoose';
import { FindExpenseDto } from './dto/find-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Expenses, ExpensesDocument } from './models/expenses.model';
import { EXPENSES_ERROR } from './constants/expenses-error.enum';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccessControlService } from '../access-control/access-control.service';

@Injectable()
export class ExpensesService {
  private readonly accessSecret: string;
  constructor(
    @InjectModel(Expenses.name)
    private readonly expensesModel: Model<Expenses>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly accessControlService: AccessControlService,
  ) {
    this.accessSecret = this.configService.get<string>('ACCESS_TOKEN_KEY');
  }
  // ToDo: move errors to constants
  async create(expense: ExpensesInputDto, token: string): Promise<ExpensesDocument> {
    try {
      const result = await this.jwtService.verifyAsync(token, { secret: this.accessSecret });
      const newExpansesInstance = new this.expensesModel({
        amount: expense.amount,
        categoryId: expense.categoryId,
        paymentSourceId: expense.paymentSourceId,
        userId: result.userId,
        comments: expense.comments,
      });
      const createdExpanse = await newExpansesInstance.save();
      return createdExpanse.toObject({ versionKey: false });
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException('Error create expenses', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getById(id: string): Promise<ExpensesDocument> {
    const foundExpanse = await this.expensesModel.findById(id);
    if (!foundExpanse) {
      throw new NotFoundException(EXPENSES_ERROR.EXPENSE_NOT_FOUND);
    }
    return foundExpanse;
  }

  async findByUserId(userId: string, token: string) {
    try {
      const currentUser = this.jwtService.verify(token, { secret: this.accessSecret });
      if (currentUser.userId !== userId) {
        const accessControlAllowed = await this.accessControlService.getAllowed(userId);
        if (accessControlAllowed?.includes(currentUser.userId)) {
          const result = await this.expensesModel.find({ userId });
          return result;
        }
        throw Error('Access denied or not accesses');
      } else {
        throw Error('You are trying to get own expenses');
      }
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      }
      const otherError = error as { message: string };
      throw new HttpException(otherError.message || 'Error find user', HttpStatus.INTERNAL_SERVER_ERROR);
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

  async find(dto: FindExpenseDto): Promise<ExpensesDocument[]> {
    //check if the dto.createdAt is an array of two Dates or is undefined and throw an error if it is not
    if (dto?.createdAt && dto.createdAt.length !== 2) {
      throw new BadRequestException(EXPENSES_ERROR.INVALID_DATE_RANGE);
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
