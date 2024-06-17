import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ERROR_AUTH } from '../constants/auth-error.enum';

export function RegisterSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create new user with default categories and payment sources',
      description: `
        Required:
        - email: string
        - password: string
        `,
    }),
    ApiResponse({ status: 201, description: 'The user has been successfully created.' }),
    ApiResponse({ status: 400, description: ERROR_AUTH.USER_ALREADY_EXISTS }),
    ApiResponse({ status: 500, description: `${ERROR_AUTH.CREATE_USER_ERROR} or ${ERROR_AUTH.SEND_EMAIL_ERROR} ` }),
  );
}
