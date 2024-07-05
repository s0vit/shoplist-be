import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { AccessControlService } from '../access-control/access-control.service';
import { ExpansesSchema, Expense } from './models/expense.model';
import { User, UserSchema } from '../auth/models/user.model';
import { AccessControlModule } from '../access-control/access-control.module';
import { AccessJwtStrategy } from '../auth/strategies/access-jwt.strategy';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpansesSchema, collection: 'Expenses' }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: 'User' }]),
    ConfigModule,
    AccessControlModule,
    CurrencyModule,
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService, AccessControlService, AccessJwtStrategy],
})
export class ExpenseModule {}
