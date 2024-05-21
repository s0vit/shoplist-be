export enum EXPENSES_ERROR {
  AMOUNT_SHOULD_BE_A_POSITIVE_NUMBER = 'Amount should be a positive number',
  EXPENSES_TYPE_ID_SHOULD_BE_A_VALID_MONGO_ID = 'ExpensesTypeId should be a valid mongoId',
  PAYMENT_SOURCE_ID_SHOULD_BE_A_VALID_MONGO_ID = 'PaymentSourceId should be a valid mongoId',
  COMMENTS_SHOULD_BE_A_STRING = 'Comments should be a string',
  COMMENTS_SHOULD_BE_LESS_THAN_100_CHARACTERS = 'Comments should be less than 100 characters',
  INVALID_DATE_RANGE = 'createdAt should be an array of two dates',
  EXPENSE_NOT_FOUND = 'Expense with such id not found',
  CREATE_EXPENSE_ERROR = 'Error during expense creation',
  ACCESS_DENIED = 'Access denied or not accesses',
  GET_OWN_EXPENSES = 'You are trying to get own expenses',
  FIND_USER_ERROR = 'Error find user',
}
