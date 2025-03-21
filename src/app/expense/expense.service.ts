import {
  ForbiddenException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccessControlService } from '../access-control/access-control.service';
import { CurrencyService } from '../currency/currency.service';
import { FamilyBudgetService } from '../family-budget/family-budget.service';
import { EXPENSE_ERROR } from './constants/expense-error.enum';
import { ExpenseInputDto } from './dto/expense-input.dto';
import { ExpenseOutputDto } from './dto/expense-output.dto';
import { ExpenseQueryInputDto } from './dto/expense-query-input.dto';
import { Expense } from './models/expense.model';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronExpenseService } from '../cron-expenses/cron-expense.service';
import { RECURRENCE_TYPES } from '../cron-expenses/constants/RECURRENCE_TYPES';
import { CURRENCIES } from '../../common/interfaces/currencies.enum';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectModel(Expense.name)
    private readonly expensesModel: Model<Expense>,
    private readonly accessControlService: AccessControlService,
    private readonly currencyService: CurrencyService,
    private readonly familyBudgetService: FamilyBudgetService,
    @Inject(forwardRef(() => CronExpenseService))
    private readonly cronExpenseService: CronExpenseService,
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS, {
    timeZone: 'UTC',
  })
  async processCronExpenses(): Promise<void> {
    const cronExpenses = await this.cronExpenseService.findAll();
    const now = new Date();

    for (const cronExpense of cronExpenses) {
      let shouldCreateExpense = false;

      const currentRates = (await this.currencyService.getRatesByDate(now)).rates;
      const currentCurrencyRate = this.currencyService.recalculateCurrencyRate(cronExpense.currency, currentRates);

      const newExpenseInstance = {
        userId: cronExpense.userId,
        amount: cronExpense.amount,
        categoryId: cronExpense.categoryId,
        paymentSourceId: cronExpense.paymentSourceId,
        comments: cronExpense.comments,
        createdAt: now,
        currency: cronExpense.currency,
        exchangeRates: currentCurrencyRate,
      };

      switch (cronExpense.recurrenceType) {
        case RECURRENCE_TYPES.DAILY:
          shouldCreateExpense = now.getHours() === 0;
          break;
        case RECURRENCE_TYPES.WEEKLY:
          shouldCreateExpense = now.getDay() === 1;
          break;
        case RECURRENCE_TYPES.MONTHLY:
          shouldCreateExpense = now.getDate() === 1;
          break;
        case RECURRENCE_TYPES.YEARLY:
          shouldCreateExpense = now.getMonth() === 0 && now.getDate() === 1;
          break;
        default:
          shouldCreateExpense = false;
          continue;
      }

      if (shouldCreateExpense) {
        await this.create(newExpenseInstance, cronExpense.userId);
      }

      if (cronExpense.recurrenceEndDate && new Date(cronExpense.recurrenceEndDate) < now) {
        await this.cronExpenseService.delete(cronExpense._id, cronExpense.userId);
      }
    }
  }

  async create(inputDto: ExpenseInputDto, userId: string): Promise<ExpenseOutputDto> {
    try {
      // get current exchange rates to USD
      const currentRates = (await this.currencyService.getRatesByDate(new Date(inputDto.createdAt))).rates;

      // recalculate currencyRate to expense currency
      const currentCurrencyRate = this.currencyService.recalculateCurrencyRate(inputDto.currency, currentRates);

      const newExpansesInstance = new this.expensesModel({
        userId: userId,
        amount: inputDto.amount,
        categoryId: inputDto.categoryId,
        paymentSourceId: inputDto.paymentSourceId,
        comments: inputDto.comments,
        createdAt: inputDto.createdAt,
        currency: inputDto.currency,
        exchangeRates: currentCurrencyRate,
      });
      const createdExpanse = await newExpansesInstance.save();

      return createdExpanse.toObject({ versionKey: false });
    } catch (error) {
      throw new HttpException(EXPENSE_ERROR.CREATE_EXPENSE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getById(expenseId: string, userId: string): Promise<ExpenseOutputDto> {
    const foundExpanse = await this.expensesModel.findById(expenseId);

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
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toString();
    const query = { userId, createdAt: { $gte: currentMonthStart, $lte: new Date().toString() } };
    if (queryInputDto?.paymentSourceId) query['paymentSourceId'] = queryInputDto.paymentSourceId;
    if (queryInputDto?.categoryId) query['categoryId'] = queryInputDto.categoryId;

    if (queryInputDto?.createdStartDate || queryInputDto?.createdEndDate) {
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
      .skip(queryInputDto?.skip)
      .limit(queryInputDto?.limit)
      .sort({ createdAt: -1 })
      .select('-__v')
      .lean();

    if (!foundExpanse) {
      throw new NotFoundException(EXPENSE_ERROR.EXPENSE_NOT_FOUND);
    }

    return foundExpanse;
  }

  async getSharedExpenses(sharedUserId: string, currentUserId: string): Promise<ExpenseOutputDto[]> {
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
        .lean()
        .exec();
    } catch (error) {
      throw new HttpException(EXPENSE_ERROR.GET_SHARED_EXPENSE, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(expenseId: string, inputDto: ExpenseInputDto, userId: string): Promise<ExpenseOutputDto> {
    try {
      const foundExpanse = await this.expensesModel.findById(expenseId);

      if (!foundExpanse) {
        throw new NotFoundException(EXPENSE_ERROR.EXPENSE_NOT_FOUND);
      }

      if (foundExpanse.userId !== userId) {
        throw new UnauthorizedException(EXPENSE_ERROR.ACCESS_DENIED);
      }

      let exchangeRates: Record<CURRENCIES, number>;
      const targetCurrency = (inputDto.currency || foundExpanse.currency) as CURRENCIES;

      if (inputDto.createdAt) {
        const inputDate = new Date(inputDto.createdAt);

        if (isNaN(inputDate.getTime())) {
          throw new HttpException('Invalid date format', HttpStatus.BAD_REQUEST);
        }

        const now = new Date();

        if (inputDate.getTime() > now.getTime()) {
          throw new HttpException('Cannot set future date for expense', HttpStatus.BAD_REQUEST);
        }
      }

      const dateChanged =
        inputDto.createdAt && new Date(inputDto.createdAt).getTime() !== foundExpanse.createdAt.getTime();
      const currencyChanged = inputDto.currency && inputDto.currency !== foundExpanse.currency;

      if (!dateChanged && !currencyChanged) {
        exchangeRates = foundExpanse.exchangeRates;
      } else {
        try {
          const targetDate = inputDto.createdAt ? new Date(inputDto.createdAt) : foundExpanse.createdAt;
          const ratesResponse = await this.currencyService.getRatesByDate(targetDate);

          if (!ratesResponse?.rates) {
            throw new HttpException('Failed to fetch exchange rates', HttpStatus.INTERNAL_SERVER_ERROR);
          }

          if (!Object.values(CURRENCIES).includes(targetCurrency)) {
            throw new HttpException('Invalid currency', HttpStatus.BAD_REQUEST);
          }

          exchangeRates = ratesResponse.rates;

          const requiredCurrencies = Object.values(CURRENCIES);
          const missingCurrencies = requiredCurrencies.filter((currency) => !(currency in exchangeRates));

          if (missingCurrencies.length > 0) {
            throw new HttpException(
              `Missing exchange rates for currencies: ${missingCurrencies.join(', ')}`,
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }

          exchangeRates = this.currencyService.recalculateCurrencyRate(targetCurrency, exchangeRates);
        } catch (error) {
          if (error instanceof HttpException) {
            throw error;
          }

          throw new HttpException(
            `Error updating exchange rates: ${error instanceof Error ? error.message : 'Unknown error'}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      const updateData = {
        ...inputDto,
        exchangeRates,
        updatedAt: new Date(),
      };

      return this.expensesModel.findByIdAndUpdate(expenseId, updateData, { new: true }).lean();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(EXPENSE_ERROR.CREATE_EXPENSE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(expenseId: string, userId: string): Promise<ExpenseOutputDto> {
    const expense = await this.expensesModel.findById(expenseId);

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
