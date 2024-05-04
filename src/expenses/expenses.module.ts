import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpensesService } from './expenses.service';
import { ExpansesSchema, Expenses } from './expenses.schema';

@Module({
  controllers: [ExpensesController],
  imports: [MongooseModule.forFeature([{ name: Expenses.name, schema: ExpansesSchema, collection: 'Expenses' }])],
  providers: [ExpensesService],
})
export class ExpensesModule {}
