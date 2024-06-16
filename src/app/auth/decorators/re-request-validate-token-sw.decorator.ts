import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ERROR_AUTH } from '../constants/auth-error.enum';

export function ReRequestVerificationTokenSwDec() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Re-request a new verification token',
      description: `
       Requires:
      - token in the header
      
      - Limit: one request per hour`,
    }),
    ApiResponse({
      status: 201,
      description: `
      ok: The new token has been successfully send to user email`,
    }),
    ApiResponse({
      status: 400,
      description: `
      BadRequestException: ${ERROR_AUTH.AUTH_ERROR_NO_TOKEN}`,
    }),
    ApiResponse({
      status: 429,
      description: `
      TooManyRequestsException: ${ERROR_AUTH.TOO_MANY_REQUESTS}`,
    }),
    ApiResponse({
      status: 500,
      description: `
      HttpException: ${ERROR_AUTH.SEND_EMAIL_ERROR}`,
    }),
  );
}
