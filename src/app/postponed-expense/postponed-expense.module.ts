import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostponedExpenseService } from './postponed-expense.service';
import { PostponedExpenseController } from './postponed-expense.controller';
import { PostponedExpense, PostponedExpenseSchema } from './models/postponed-expense.model';
import { ExpenseModule } from '../expense/expense.module';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: PostponedExpense.name, schema: PostponedExpenseSchema }]),
    ExpenseModule,
    CurrencyModule,
  ],
  controllers: [PostponedExpenseController],
  providers: [PostponedExpenseService],
  exports: [PostponedExpenseService],
})
export class PostponedExpenseModule {}
