export enum CATEGORY_ERROR {
  TITLE_SHOULD_BE_LESS_THAN_16_CHARACTERS = 'Title should be less than 16 characters',
  COMMENTS_SHOULD_BE_LESS_THAN_100_CHARACTERS = 'Comments should be less than 100 characters',
  CREATE_CATEGORY_ERROR = 'Error create category',
  UPDATE_CATEGORY_ERROR = 'Error update category',
  GET_CATEGORIES_ERROR = 'Error get categories',
  DELETE_CATEGORY_ERROR = 'Error delete category',
  COLOR_SHOULD_BE_HEX = 'Color should be a hex color',
  INVALID_MONGODB_OBJECT_ID = 'Invalid MongoDB object id',
  CATEGORY_NOT_FOUND = 'Category not found',
  CATEGORY_ALREADY_EXIST = 'Category already exist',
  FORBIDDEN = 'Forbidden',
}
