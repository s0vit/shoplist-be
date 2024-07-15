import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
} from '@nestjs/swagger';
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
    ApiCreatedResponse({ description: 'The user has been successfully created.', type: String }),
    ApiBadRequestResponse({ description: ERROR_AUTH.USER_ALREADY_EXISTS }),
    ApiInternalServerErrorResponse({
      description: `${ERROR_AUTH.CREATE_USER_ERROR} or ${ERROR_AUTH.SEND_EMAIL_ERROR} `,
    }),
  );
}
