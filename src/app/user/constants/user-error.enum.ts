export enum USER_ERROR {
  CREATE_CATEGORY_AND_PAYMENT_SOURCE_ERROR = 'Error create category',
  CREATE_EXPENSES_ERROR = 'Error create expenses',
  CATEGORY_OR_PAYMENT_SOURCE_ALREADY_EXIST = 'Category or Payment source already exist',
  FORBIDDEN = 'Forbidden',
  DELETE_USER_ERROR = 'Error delete user',
  FIND_USER_ERROR = 'Error find user',
  TOKENS_MISMATCH = 'Tokens do not match',
  NO_FILE = 'No file provided',
  NOT_IMAGE = 'Provided file is not an image',
  UPLOAD_AVATAR_ERROR = 'Error upload avatar',
  COMPRESS_IMAGE_ERROR = 'Error compress image',
}
