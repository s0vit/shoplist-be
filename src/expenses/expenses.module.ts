import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpansesSchema, Expenses } from './expenses.schema';

@Module({
  controllers: [ExpensesController],
  imports: [MongooseModule.forFeature([{ name: Expenses.name, schema: ExpansesSchema }])],
})
export class ExpensesModule {}
