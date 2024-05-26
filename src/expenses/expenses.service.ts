import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExpensesInputDto } from './dto/expenses-input.dto';
import { Model } from 'mongoose';
import { FindExpenseDto } from './dto/find-expense.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Expenses, ExpensesDocument } from './models/expenses.model';
import { EXPENSES_ERROR } from './constants/expenses-error.enum';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AccessControlService } from '../access-control/access-control.service';
import { TokenPayload } from 'src/common/interfaces/token.interface';

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

  async create(expense: ExpensesInputDto, token: string): Promise<ExpensesDocument> {
    try {
      const result = await this.jwtService.verifyAsync<TokenPayload>(token, { secret: this.accessSecret });
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
  async getOwn(userId: string) {
    const arrayExpenses = await this.expensesModel.find({ userId });
    return arrayExpenses.map((expenses) => expenses.toObject({ versionKey: false }));
  }
  async getSharedExpenses(sharedUserId: string, currentUserId: string): Promise<ExpensesDocument[]> {
    if (currentUserId === sharedUserId) {
      throw new ForbiddenException(EXPENSES_ERROR.GET_OWN_EXPENSES);
    }
    const accessControlAllowed = await this.accessControlService._getAllowedExpensesId(sharedUserId, currentUserId);
    if (!accessControlAllowed) {
      throw new ForbiddenException(EXPENSES_ERROR.ACCESS_DENIED);
    }
    // ToDo: add try/catch
    const arrayExpenses = await this.expensesModel.find({ _id: { $in: accessControlAllowed } });
    return arrayExpenses.map((expenses) => expenses.toObject({ versionKey: false }));
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
