import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfig } from '../../configs/jwt.config';
import { ExpensesController } from './expenses.controller';
import { AccessJwtStrategy } from '../auth/strategies/access-jwt.strategy';
import { ExpensesService } from './expenses.service';
import { AccessControlService } from '../access-control/access-control.service';
import { ExpansesSchema, Expenses } from './models/expenses.model';
import { User, UserSchema } from '../auth/models/user.model';
import { AccessControlModule } from '../access-control/access-control.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expenses.name, schema: ExpansesSchema, collection: 'Expenses' }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: 'User' }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: jwtConfig,
    }),
    ConfigModule,
    AccessControlModule,
    PassportModule,
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService, AccessControlService, AccessJwtStrategy],
})
export class ExpensesModule {}
