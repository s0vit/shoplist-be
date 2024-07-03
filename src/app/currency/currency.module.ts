import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CurrencyService } from './currency.service';
import { CurrencyRate, CurrencyRateSchema } from './models/currency-rate.model';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { UtilsService } from '../../common/utils/utils.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CurrencyRate.name, schema: CurrencyRateSchema }]),
    HttpModule,
    ConfigModule,
    ScheduleModule.forRoot(),
  ],
  providers: [CurrencyService, UtilsService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
