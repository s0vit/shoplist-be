import { Module } from '@nestjs/common';
import { AccessControlController } from './access-control.controller';
import { AccessControlService } from './access-control.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AccessControl, AccessControlSchema } from './models/access-control.model';
import { ExpansesSchema, Expense } from '../expense/models/expense.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AccessControl.name, schema: AccessControlSchema, collection: 'AccessControl' }]),
  ],
  controllers: [AccessControlController],
  providers: [AccessControlService],
  exports: [MongooseModule.forFeature([{ name: Expense.name, schema: ExpansesSchema, collection: 'Expenses' }])],
})
export class AccessControlModule {}
