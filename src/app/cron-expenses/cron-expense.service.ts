import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CronExpense, CronExpenseDocument } from './models/cron-expense.model';
import { CronExpenseInputDto } from './dto/cron-expense-input.dto';
import { ExpenseService } from '../expense/expense.service';
import { CronExpenseOutputDto } from './dto/cron-expense-output.dto';

@Injectable()
export class CronExpenseService {
  constructor(
    @InjectModel(CronExpense.name)
    private readonly cronExpense: Model<CronExpenseDocument>,
    @Inject(forwardRef(() => ExpenseService))
    private readonly expenseService: ExpenseService,
  ) {}

  async create(cronExpenseDto: CronExpenseInputDto, userId: string): Promise<CronExpenseOutputDto> {
    if (cronExpenseDto.recurrenceEndDate && cronExpenseDto.recurrenceEndDate < cronExpenseDto.createdAt) {
      throw new BadRequestException('Recurrence end date must be after created at date');
    }

    const newCronExpense = new this.cronExpense({ ...cronExpenseDto, userId });

    return newCronExpense.save();
  }

  async findAll(): Promise<CronExpenseOutputDto[]> {
    return this.cronExpense.find().exec();
  }

  async findOwn(userId: string): Promise<CronExpenseOutputDto[]> {
    return this.cronExpense.find({ userId }).exec();
  }

  async findById(id: string, userId: string): Promise<CronExpenseOutputDto> {
    const cronExpense = await this.cronExpense.findOne({ _id: id, userId }).exec();

    if (!cronExpense) {
      throw new NotFoundException('Cron task not found');
    }

    return cronExpense;
  }

  async update(id: string, cronExpenseDto: CronExpenseInputDto, userId: string): Promise<CronExpenseOutputDto> {
    const cronExpense = await this.cronExpense.findOne({ _id: id, userId }).exec();

    if (!cronExpense) {
      throw new NotFoundException('Cron task not found');
    }

    return await this.cronExpense.findByIdAndUpdate(id, { ...cronExpenseDto }, { new: true }).exec();
  }

  async delete(id: string, userId: string): Promise<void> {
    const cronExpense = await this.cronExpense.findOne({ _id: id, userId }).exec();

    if (!cronExpense) {
      throw new NotFoundException('Cron task not found');
    }

    const result = await this.cronExpense.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Cron task not found');
    }
  }
}
