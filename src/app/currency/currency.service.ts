import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { CURRENCIES } from '../../common/interfaces/currencies.enum';
import { CURRENCY_ERROR } from './constants/currency-error.enum';
import { CurrencyRate, CurrencyRateDocument } from './models/currency-rate.model';

@Injectable()
export class CurrencyService {
  private readonly apiUrl = 'https://api.freecurrencyapi.com/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(CurrencyRate.name) private currencyRateModel: Model<CurrencyRateDocument>,
  ) {}

  /**
   * Docs: https://docs.nestjs.com/techniques/task-scheduling
   */
  @Cron(CronExpression.EVERY_HOUR, {
    timeZone: 'UTC',
  })
  async updateCurrencyRates(): Promise<Record<string, number>> {
    console.info('Updating currency rates', new Date());

    try {
      const ratesResponse = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/latest?apikey=${this.configService.get('CURRENCY_API_KEY')}`),
      );
      const rates = ratesResponse.data.data;

      const freeCurrencyAccount = await firstValueFrom(
        this.httpService.get(`${this.apiUrl}/status?apikey=${this.configService.get('CURRENCY_API_KEY')}`),
      );
      console.info('Free currency account status', freeCurrencyAccount.data);

      const currencyRate = new this.currencyRateModel({
        date: new Date().toISOString(),
        base: CURRENCIES.USD,
        rates: rates,
      });

      await currencyRate.save();

      console.info('Currency rates updated successfully', { ratesToUsd: rates });

      return rates;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(CURRENCY_ERROR.ERROR_FETCHING_EXCHANGE_RATES);
    }
  }

  async getRatesByDate(date: Date): Promise<CurrencyRate> {
    const rate = await this.currencyRateModel
      .findOne({
        date: {
          $gte: new Date(date).setMinutes(0, 0, 0),
          $lt: new Date(date).setMinutes(59, 59, 999),
        },
      })
      .exec();

    //if rate not found try to update rates and get again
    if (!rate) {
      const rates = await this.updateCurrencyRates();

      return {
        date: new Date(date),
        base: CURRENCIES.USD,
        rates,
      };
    }

    //if rate still not found throw error
    if (!rate) {
      throw new NotFoundException(CURRENCY_ERROR.RATES_NOT_FOUND);
    }

    return rate;
  }


  recalculateCurrencyRate(currency: CURRENCIES, rates: Record<CURRENCIES, number>): Record<CURRENCIES, number> {
    const currentCurrencyRate = rates[currency];

    for (const currency in rates) {
      if (rates.hasOwnProperty(currency)) {
        rates[currency] = rates[currency] / currentCurrencyRate;
      }
    }

    return rates
  }
}
