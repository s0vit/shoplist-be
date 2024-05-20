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
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService, AccessControlService],
})
export class ExpensesModule {}
