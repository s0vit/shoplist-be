import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CronExpenseService } from './cron-expense.service';
import { CronExpenseController } from './cron-expense.controller';
import { CronExpense, CronExpenseSchema } from './models/cron-expense.model';
import { ExpenseModule } from '../expense/expense.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CronExpense.name, schema: CronExpenseSchema }]),
    forwardRef(() => ExpenseModule),
  ],
  providers: [CronExpenseService],
  controllers: [CronExpenseController],
  exports: [CronExpenseService],
})
export class CronExpenseModule {}
