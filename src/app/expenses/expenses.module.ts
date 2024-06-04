import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpensesService } from './expenses.service';
import { ExpansesSchema, Expenses } from './models/expenses.model';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AccessJwtStrategy } from '../auth/strategies/access-jwt.strategy';
import { jwtConfig } from '../../configs/jwt.config';
import { AccessControlModule } from '../../access-control/access-control.module';
import { AccessControlService } from '../../access-control/access-control.service';
import { User, UserSchema } from '../auth/models/user.model';

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
