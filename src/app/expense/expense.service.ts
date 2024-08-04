import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccessControlService } from '../access-control/access-control.service';
import { CurrencyService } from '../currency/currency.service'; // Добавлено
import { FamilyBudgetService } from '../family-budget/family-budget.service';
import { EXPENSE_ERROR } from './constants/expense-error.enum';
import { ExpenseInputDto } from './dto/expense-input.dto';
import { ExpenseOutputDto } from './dto/expense-output.dto';
import { ExpenseQueryInputDto } from './dto/expense-query-input.dto';
import { Expense, ExpensesDocument } from './models/expense.model';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name)
    private readonly expensesModel: Model<Expense>,
    private readonly accessControlService: AccessControlService,
    private readonly currencyService: CurrencyService,
    private readonly familyBudgetService: FamilyBudgetService,
  ) {}

  async create(inputDto: ExpenseInputDto, userId: string): Promise<ExpenseOutputDto> {
    try {
      // get current exchange rates to USD
      const currentRates = (await this.currencyService.getRatesByDate(new Date(inputDto.createdAt))).rates;

      // recalculate currencyRate to expense currency
      const currentCurrencyRate = this.currencyService.recalculateCurrencyRate(
        inputDto.currency,
        currentRates,
      );

      const newExpansesInstance = new this.expensesModel({
        userId: userId,
        amount: inputDto.amount,
        categoryId: inputDto.categoryId,
        paymentSourceId: inputDto.paymentSourceId,
        comments: inputDto.comments,
        createdAt: inputDto.createdAt,
        currency: inputDto.currency,
        exchangeRates: currentRates,
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

  async getBulk(expenseIds: string[], userId: string): Promise<ExpenseOutputDto[]> {
    const foundExpanse = await this.expensesModel
      .find({ _id: { $in: expenseIds } })
      .select('-__v')
      .lean();

    const sharedWithMeAccessControls = await this.accessControlService.getSharedWithMe(userId);
    // check if getting own or shared expense
    foundExpanse.forEach((expense) => {
      const isShared = sharedWithMeAccessControls.some((accessControl) =>
        accessControl.expenseIds.includes(expense._id),
      );
      const isOwner = expense.userId === userId;

      if (!isShared && !isOwner) {
        throw new UnauthorizedException(EXPENSE_ERROR.ACCESS_DENIED);
      }
    });

    return foundExpanse;
  }

  async getByCategory(categoryId: string, userId: string): Promise<ExpenseOutputDto[]> {
    const foundExpenses = await this.expensesModel.find({ categoryId }).select('-__v').lean();
    const sharedWithMeAccessControls = await this.accessControlService.getSharedWithMe(userId);

    foundExpenses.forEach((expense) => {
      const isShared = sharedWithMeAccessControls.some((accessControl) =>
        accessControl.categoryIds.includes(categoryId),
      );
      const isOwner = expense.userId === userId;

      if (!isShared && !isOwner) {
        throw new UnauthorizedException(EXPENSE_ERROR.ACCESS_DENIED);
      }
    });

    return foundExpenses;
  }

  async getByPaymentSource(paymentSourceId: string, userId: string): Promise<ExpenseOutputDto[]> {
    const foundExpenses = await this.expensesModel.find({ paymentSourceId }).select('-__v').lean();
    const sharedWithMeAccessControls = await this.accessControlService.getSharedWithMe(userId);

    foundExpenses.forEach((expense) => {
      const isShared = sharedWithMeAccessControls.some((accessControl) =>
        accessControl.paymentSourceIds.includes(paymentSourceId),
      );
      const isOwner = expense.userId === userId;

      if (!isShared && !isOwner) {
        throw new UnauthorizedException(EXPENSE_ERROR.ACCESS_DENIED);
      }
    });

    return foundExpenses;
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
      .sort({ createdAt: -1 })
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

    //if expense create date is changed, we need to update exchange rates
    let exchangeRates = foundExpanse.exchangeRates;

    if (inputDto.createdAt && inputDto.createdAt !== foundExpanse.createdAt) {
      exchangeRates = (await this.currencyService.getRatesByDate(new Date(inputDto.createdAt))).rates;
    }

    //if currency is changed, we need to recalculate exchange rates
    if (inputDto.currency && inputDto.currency !== foundExpanse.currency) {
      exchangeRates = this.currencyService.recalculateCurrencyRate(inputDto.currency, exchangeRates);
    }

    return this.expensesModel.findByIdAndUpdate(expensesId, { ...inputDto, exchangeRates }, { new: true }).lean();
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

  async getExpensesByFamilyBudgetId(familyBudgetId: string, userId: string): Promise<ExpenseOutputDto[]> {
    const familyBudget = await this.familyBudgetService.findOne(familyBudgetId, userId);

    if (!familyBudget) {
      throw new NotFoundException(EXPENSE_ERROR.FAMILY_BUDGET_NOT_FOUND);
    }

    return this.expensesModel.find({ familyBudgetId }).select('-__v').lean();
  }
}
