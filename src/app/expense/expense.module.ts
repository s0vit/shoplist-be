import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { AccessControlModule } from '../access-control/access-control.module';
import { AccessControlService } from '../access-control/access-control.service';
import { AccessJwtStrategy } from '../auth/strategies/access-jwt.strategy';
import { CurrencyModule } from '../currency/currency.module';
import { FamilyBudgetModule } from '../family-budget/family-budget.module';
import { User, UserSchema } from '../user/models/user.model';
import { Category, CategorySchema } from '../category/models/category.model';
import { PaymentSource, PaymentSourceSchema } from '../payment-source/models/payment-source.model';
import { UserConfig, UserConfigSchema } from '../user-config/model/user-config.model';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';
import { ReceiptAiService } from './receipt-ai.service';
import { ExpansesSchema, Expense } from './models/expense.model';
import { CronExpenseModule } from '../cron-expenses/cron-expense.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpansesSchema, collection: 'Expenses' }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: 'User' }]),
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema, collection: 'Category' }]),
    MongooseModule.forFeature([{ name: PaymentSource.name, schema: PaymentSourceSchema, collection: 'PaymentSource' }]),
    MongooseModule.forFeature([{ name: UserConfig.name, schema: UserConfigSchema, collection: 'UserConfig' }]),
    ConfigModule,
    HttpModule,
    AccessControlModule,
    CurrencyModule,
    FamilyBudgetModule,
    forwardRef(() => CronExpenseModule),
  ],
  controllers: [ExpenseController],
  providers: [ExpenseService, ReceiptAiService, AccessControlService, AccessJwtStrategy],
  exports: [ExpenseService],
})
export class ExpenseModule {}
