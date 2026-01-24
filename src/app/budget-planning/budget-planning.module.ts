import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BudgetPlanningController } from './budget-planning.controller';
import { BudgetPlanningService } from './budget-planning.service';
import { BudgetNotificationService } from './budget-notification.service';
import { BudgetAlert, BudgetAlertSchema } from './models/budget-alert.model';
import { BudgetPlan, BudgetPlanSchema } from './models/budget-plan.model';
import { Expense, ExpansesSchema } from '../expense/models/expense.model';
import { Category, CategorySchema } from '../category/models/category.model';
import { PaymentSource, PaymentSourceSchema } from '../payment-source/models/payment-source.model';
import { CurrencyModule } from '../currency/currency.module';

@Module({
  imports: [
    CurrencyModule,
    MongooseModule.forFeature([{ name: BudgetPlan.name, schema: BudgetPlanSchema, collection: 'BudgetPlan' }]),
    MongooseModule.forFeature([{ name: BudgetAlert.name, schema: BudgetAlertSchema, collection: 'BudgetAlert' }]),
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpansesSchema, collection: 'Expenses' }]),
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema, collection: 'Category' }]),
    MongooseModule.forFeature([{ name: PaymentSource.name, schema: PaymentSourceSchema, collection: 'PaymentSource' }]),
  ],
  controllers: [BudgetPlanningController],
  providers: [BudgetPlanningService, BudgetNotificationService],
  exports: [BudgetPlanningService],
})
export class BudgetPlanningModule {}
