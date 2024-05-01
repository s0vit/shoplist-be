import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpansesSchema, Expenses } from './expenses.schema';
import { ExpensesService } from './expenses.service';

@Module({
  controllers: [ExpensesController],
  imports: [MongooseModule.forFeature([{ name: Expenses.name, schema: ExpansesSchema }])],
  providers: [ExpensesService],
})
export class ExpensesModule {}
