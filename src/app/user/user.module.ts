import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsService } from '../../common/utils/utils.service';
import { jwtConfig } from '../../configs/jwt.config';
import { AccessJwtStrategy } from '../auth/strategies/access-jwt.strategy';
import { Category, CategorySchema } from '../category/models/category.model';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { ExpansesSchema, Expense } from '../expense/models/expense.model';
import { PaymentSource, PaymentSourceSchema } from '../payment-source/models/payment-source.model';
import { User, UserSchema } from './models/user.model';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: 'User' }]),
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema, collection: 'Category' }]),
    MongooseModule.forFeature([{ name: PaymentSource.name, schema: PaymentSourceSchema, collection: 'PaymentSource' }]),
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpansesSchema, collection: 'Expenses' }]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: jwtConfig,
    }),
    CloudinaryModule,
  ],
  providers: [UserService, UtilsService, AccessJwtStrategy],
  controllers: [UserController],
})
export class UserModule {}
