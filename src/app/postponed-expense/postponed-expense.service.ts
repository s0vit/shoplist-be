import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostponedExpense, PostponedExpenseDocument } from './models/postponed-expense.model';
import { PostponedExpenseInputDto } from './dto/postponed-expense-input.dto';
import { ExpenseService } from '../expense/expense.service';
import { CurrencyService } from '../currency/currency.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PostponedExpenseService {
  constructor(
    @InjectModel(PostponedExpense.name)
    private readonly postponedExpenseModel: Model<PostponedExpense>,
    private readonly expenseService: ExpenseService,
    private readonly currencyService: CurrencyService,
  ) {}

  async create(inputDto: PostponedExpenseInputDto, userId: string): Promise<PostponedExpenseDocument> {
    if (new Date(inputDto.scheduledDate) <= new Date()) {
      throw new Error('Scheduled date must be in the future');
    }

    const postponedExpense = new this.postponedExpenseModel({
      ...inputDto,
      userId,
      isProcessed: false,
    });

    return postponedExpense.save();
  }

  async findAll(userId: string): Promise<PostponedExpenseDocument[]> {
    return this.postponedExpenseModel.find({ userId, isProcessed: false }).sort({ scheduledDate: 1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<PostponedExpenseDocument> {
    const postponedExpense = await this.postponedExpenseModel.findById(id);

    if (!postponedExpense) {
      throw new NotFoundException('Postponed expense not found');
    }

    if (postponedExpense.userId !== userId) {
      throw new UnauthorizedException('Access denied');
    }

    return postponedExpense;
  }

  async update(id: string, inputDto: PostponedExpenseInputDto, userId: string): Promise<PostponedExpenseDocument> {
    const postponedExpense = await this.findOne(id, userId);

    if (postponedExpense.isProcessed) {
      throw new Error('Cannot update processed expense');
    }

    if (new Date(inputDto.scheduledDate) <= new Date()) {
      throw new Error('Scheduled date must be in the future');
    }

    Object.assign(postponedExpense, inputDto);

    return postponedExpense.save();
  }

  async remove(id: string, userId: string): Promise<PostponedExpenseDocument> {
    const postponedExpense = await this.findOne(id, userId);

    if (postponedExpense.isProcessed) {
      throw new Error('Cannot delete processed expense');
    }

    await postponedExpense.deleteOne();

    return postponedExpense;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledExpenses() {
    const now = new Date();
    const pendingExpenses = await this.postponedExpenseModel.find({
      isProcessed: false,
      scheduledDate: { $lte: now },
    });

    for (const expense of pendingExpenses) {
      try {
        const currentRates = (await this.currencyService.getRatesByDate(now)).rates;

        await this.expenseService.create(
          {
            amount: expense.amount,
            categoryId: expense.categoryId,
            paymentSourceId: expense.paymentSourceId,
            comments: expense.comments,
            currency: expense.currency,
            createdAt: expense.scheduledDate,
          },
          expense.userId,
        );

        expense.isProcessed = true;
        expense.processedAt = now;
        expense.processedExchangeRates = currentRates;
        await expense.save();
      } catch (error) {
        console.error(`Failed to process postponed expense ${expense._id}:`, error);
      }
    }
  }
}
