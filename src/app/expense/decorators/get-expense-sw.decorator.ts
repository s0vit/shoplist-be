import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ExpenseOutputDto } from '../dto/expense-output.dto';
import { EXPENSE_ERROR } from '../constants/expense-error.enum';

export function GetExpenseSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get users Expenses by ID from a cookie or by a Query request.',
      description: `
      ATTENTION! data from "Query" is not processed!
      
        Requires:
        - token in Cookies

        Optionally:
        - createdStartDate in Params
        - createdEndDate in Params
        - paymentSourceId in Params
        - expensesTypeId in Params
        - limit in Params
        - skip in Params`,
    }),
    ApiCookieAuth(),
    ApiQuery({
      name: 'createdStartDate',
      type: Date,
      required: false,
      description: `
      createdStartDate: Start date`,
      example: '2024-05-18T08:36:41.000',
    }),
    ApiQuery({
      name: 'createdEndDate',
      type: Date,
      required: false,
      description: `
      createdEndDate: End date`,
      example: '2024-06-18T08:36:41.000',
    }),
    ApiQuery({
      name: 'paymentSourceId',
      type: String,
      required: false,
      description: `
      paymentSourceId: Payment source ID`,
      example: '6616f96da226986482597b6c',
    }),
    ApiQuery({
      name: 'expensesTypeId',
      type: String,
      required: false,
      description: `
      expensesTypeId: Expenses type ID`,
      example: '6616f96da226986482597b6c',
    }),
    ApiQuery({
      name: 'limit',
      type: Number,
      required: false,
      description: `
      limit: Count of expenses to receive`,
      example: 100,
    }),
    ApiQuery({
      name: 'skip',
      type: Number,
      required: false,
      description: `
      skip: Count of expenses to skip`,
      example: 10,
    }),
    ApiResponse({
      status: 200,
      description: `
      ok: The users Expenses successfully received.`,
      type: ExpenseOutputDto,
      isArray: true,
    }),
    ApiResponse({
      status: 404,
      description: `
      Bad Request: ${EXPENSE_ERROR.EXPENSE_NOT_FOUND}`,
    }),
  );
}
