export enum ERROR_AUTH {
  NOT_USER = 'Not user',
  UNKNOWN_ERROR = 'Unknown error',
  UPDATE_ERROR = 'Update error',
  LOGOUT_ERROR = 'Logout error',
  LOGOUT_SUCCESS = 'Logout success',
  SUCCESSFUL_AUTHORIZATION = 'Successful authorization',
  AUTH_ME_OK = 'Auth ok',
  AUTH_ME_ERROR_INVALID = 'Invalid token',
  TOKEN_ERROR = 'Token validation error',
  USER_SUCCESSFULLY_CREATED = 'User successfully created',
  AUTH_ERROR_NO_TOKEN = 'No token',
  UNAUTHORIZED = 'Invalid username or password',
  USER_ALREADY_EXISTS = 'User already exists',
  PASSWORD_ERROR = 'Password must contain at least one digit and one uppercase letter.',
  LOGIN_ERROR = 'Login must not be numeric',
  LOGIN_LENGTH_ERROR = 'Login length must be at least 3 characters',
  SEND_EMAIL_ERROR = 'Failed to confirmation email.',
  CONFIRM_REGISTRATION_ERROR = 'Error confirm data',
  INVALID_AUTHENTICATION_CREDENTIALS = 'Invalid authentication credentials',
}

export const COOKIE_SETTINGS = {
  ACCESS_TOKEN: {
    httpOnly: true,
    secure: false, // ToDo: On production change to true
    maxAge: 72e5, // 2 hour
  },
};
