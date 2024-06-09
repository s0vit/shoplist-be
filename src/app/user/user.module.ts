import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../auth/models/user.model';
import { Category, CategorySchema } from '../category/models/category.model';
import { UtilsService } from '../../common/utils/utils.service';
import { PaymentSource, PaymentSourceSchema } from '../payment-source/models/payment-source.model';
import { ConfigModule } from '@nestjs/config';
import { ExpansesSchema, Expense } from '../expense/models/expense.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: 'User' }]),
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema, collection: 'Category' }]),
    MongooseModule.forFeature([{ name: PaymentSource.name, schema: PaymentSourceSchema, collection: 'PaymentSource' }]),
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpansesSchema, collection: 'Expenses' }]),
    ConfigModule,
  ],
  providers: [UserService, UtilsService],
  controllers: [UserController],
})
export class UserModule {}
