import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpensesService } from './expenses.service';
import { ExpansesSchema, Expenses } from './models/expenses.model';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfig } from '../configs/jwt.config';
import { AccessControlService } from '../access-control/access-control.service';
import { AccessControlModule } from '../access-control/access-control.module';
import { AccessJwtStrategy } from './strategies/access-jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expenses.name, schema: ExpansesSchema, collection: 'Expenses' }]),
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
