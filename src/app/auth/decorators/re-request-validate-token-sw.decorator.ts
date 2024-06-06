import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function ReRequestVerificationTokenSwDec() {
  return applyDecorators(
    ApiCookieAuth(),
    ApiOperation({ summary: 'Re-request a new verification token' }),
    ApiResponse({
      status: 201,
      description: 'The new token has been successfully send to user email',
    }),
  );
}
