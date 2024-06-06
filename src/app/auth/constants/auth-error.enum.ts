export enum ERROR_AUTH {
  LOGOUT_ERROR = 'Logout error',
  AUTH_ERROR_TOKEN = 'No token or invalid token',
  AUTH_ERROR_NO_TOKEN = 'No token',
  UNAUTHORIZED = 'Invalid username or password',
  USER_ALREADY_EXISTS = 'User already exists',
  PASSWORD_ERROR = 'Password must contain at least one digit and one uppercase letter.',
  SEND_EMAIL_ERROR = 'Failed to confirmation email.',
  CONFIRM_REGISTRATION_ERROR = 'Error confirm data',
  INVALID_AUTHENTICATION_CREDENTIALS = 'Invalid authentication credentials',
  VERIFIED_USER_ERROR = 'User is not verified',
  NOT_FOUND_USER = 'User not found',
}
