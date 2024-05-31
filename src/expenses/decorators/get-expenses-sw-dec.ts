import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export function GetExpensesSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get users Expenses',
      description: 'Requires a token in cookies',
    }),
    ApiQuery({
      name: 'createdStartDate',
      type: 'Date',
      required: false,
      description: 'Start date',
      example: '2024-05-18T08:36:41.000',
    }),
    ApiQuery({
      name: 'createdEndDate',
      type: 'Date',
      required: false,
      description: 'End date',
      example: '2024-06-18T08:36:41.000',
    }),
    ApiQuery({
      name: 'paymentSourceId',
      type: 'string',
      required: false,
      description: 'Category ID',
      example: '6616f96da226986482597b6c',
    }),
    ApiQuery({
      name: 'expensesTypeId',
      type: 'string',
      required: false,
      description: 'Expenses ID',
      example: '6616f96da226986482597b6c',
    }),
    ApiQuery({
      name: 'limit',
      type: 'number',
      required: false,
      description: 'Count of expenses to show',
      example: 100,
    }),
    ApiQuery({
      name: 'skip',
      type: 'number',
      required: false,
      description: 'Count of expenses to skip',
      example: 10,
    }),
    ApiCookieAuth('accessToken'),
    ApiResponse({
      status: 200,
      description: 'The users Expenses successfully received.',
    }),
  );
}
