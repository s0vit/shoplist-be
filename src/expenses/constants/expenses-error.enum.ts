export enum EXPENSES_ERROR {
  COMMENTS_SHOULD_BE_A_STRING = 'Comments should be a string',
  COMMENTS_SHOULD_BE_LESS_THAN_100_CHARACTERS = 'Comments should be less than 100 characters',
  EXPENSE_NOT_FOUND = 'Expense with such id not found',
  CREATE_EXPENSE_ERROR = 'Error during expense creation...',
  ACCESS_DENIED = 'Access denied or not accesses',
  GET_OWN_EXPENSES = 'You are trying to get own expenses',
  GET_SHARED_EXPENSES = 'Error shared expenses...',
}
