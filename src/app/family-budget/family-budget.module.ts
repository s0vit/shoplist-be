import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FamilyBudgetController } from './family-budget.controller';
import { FamilyBudgetService } from './family-budget.service';
import { FamilyBudget, FamilyBudgetSchema } from './models/family-budget.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: FamilyBudget.name, schema: FamilyBudgetSchema }])],
  controllers: [FamilyBudgetController],
  providers: [FamilyBudgetService],
  exports: [FamilyBudgetService],
})
export class FamilyBudgetModule {}
