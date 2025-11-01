import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ExpenseAnalyticsResponseDto } from '../dto/expense-analytics-response.dto';
import { AnalyticsTrendGranularity } from '../dto/expense-analytics-query.dto';
import { CURRENCIES } from '../../../common/interfaces/currencies.enum';

export function GetExpenseAnalyticsSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить агрегированную аналитику по расходам с гибкими фильтрами и AI-инсайтами',
      description: `
        Возвращает агрегированные показатели по расходам, разбивки по категориям, источникам и динамику во времени.
        По умолчанию анализируется текущий месяц. Можно включить AI-описание.
      `,
    }),
    ApiBearerAuth(),
    ApiQuery({
      name: 'createdStartDate',
      required: false,
      type: String,
      description: 'Начальная дата (ISO). По умолчанию — первый день текущего месяца (UTC).',
    }),
    ApiQuery({
      name: 'createdEndDate',
      required: false,
      type: String,
      description: 'Конечная дата (ISO). По умолчанию — текущий момент (UTC).',
    }),
    ApiQuery({
      name: 'categoryIds',
      required: false,
      isArray: true,
      type: String,
      description: 'Список ID категорий для фильтрации (через массив или через запятую).',
    }),
    ApiQuery({
      name: 'paymentSourceIds',
      required: false,
      isArray: true,
      type: String,
      description: 'Список ID источников оплаты для фильтрации (через массив или через запятую).',
    }),
    ApiQuery({
      name: 'currencies',
      required: false,
      isArray: true,
      enum: CURRENCIES,
      description: 'Ограничить выборку исходными валютами расходов.',
    }),
    ApiQuery({
      name: 'amountStart',
      required: false,
      type: Number,
      description: 'Минимальная сумма транзакции (в исходной валюте записи).',
    }),
    ApiQuery({
      name: 'amountEnd',
      required: false,
      type: Number,
      description: 'Максимальная сумма транзакции (в исходной валюте записи).',
    }),
    ApiQuery({
      name: 'targetCurrency',
      required: false,
      enum: CURRENCIES,
      description: 'Валюта, в которой возвращаются агрегаты. По умолчанию — валюта профиля или USD.',
    }),
    ApiQuery({
      name: 'hasComments',
      required: false,
      type: Boolean,
      description: 'true — только расходы с комментариями, false — только без комментариев.',
    }),
    ApiQuery({
      name: 'searchTerm',
      required: false,
      type: String,
      description: 'Поиск по комментариям (регистронезависимый).',
    }),
    ApiQuery({
      name: 'trendGranularity',
      required: false,
      enum: AnalyticsTrendGranularity,
      description: 'Шаг агрегации для динамики: day, week, month, year. По умолчанию — month.',
    }),
    ApiQuery({
      name: 'includeAiAnalysis',
      required: false,
      type: Boolean,
      description: 'Включить генерацию компактного AI-анализа (требует сконфигурированный GEMINI_API_KEY).',
    }),
    ApiResponse({
      status: 200,
      description: 'Агрегированная статистика по расходам.',
      type: ExpenseAnalyticsResponseDto,
    }),
  );
}
