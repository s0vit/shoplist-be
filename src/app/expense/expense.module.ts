import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessControlModule } from '../access-control/access-control.module';
import { AccessControlService } from '../access-control/access-control.service';
import { AccessJwtStrategy } from '../auth/strategies/access-jwt.strategy';
import { CurrencyModule } from '../currency/currency.module';
import { FamilyBudgetModule } from '../family-budget/family-budget.module';
import { User, UserSchema } from '../user/models/user.model';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { ExpansesSchema, Expense } from './models/expense.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpansesSchema, collection: 'Expenses' }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: 'User' }]),
    ConfigModule,
    AccessControlModule,
    CurrencyModule,
    FamilyBudgetModule,
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService, AccessControlService, AccessJwtStrategy],
})
export class ExpenseModule {}
