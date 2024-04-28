import { Module } from '@nestjs/common';
import { ExpensesTypeController } from './expenses-type.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpensesType, ExpensesTypeSchema } from './expenses-type.schema';

@Module({
  controllers: [ExpensesTypeController],
  imports: [MongooseModule.forFeature([{ name: ExpensesType.name, schema: ExpensesTypeSchema }])],
})
export class ExpensesTypeModule {}
