export enum ACCESS_CONTROL_ERROR {
  CREATE_ACCESS_ERROR = 'Error create access control',
  DELETE_ACCESS_ERROR = 'Error delete user',
  OWN_ACCESS_ERROR = 'You cannot share with yourself',
  NOT_FOUND = 'Access control not found',
  FORBIDDEN = 'Forbidden, you do not have access to this resource',
  DELETE_ME_ERROR = 'Error delete me from shared',
  DUPLICATE_EXPENSES = 'You already shared this expenses with this user',
  DUPLICATE_CATEGORIES = 'You already shared this categories with this user',
  DUPLICATE_PAYMENT_SOURCES = 'You already shared this payment sources with this user',
}
