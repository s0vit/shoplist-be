import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function ForgotPasswordSwDec() {
  return applyDecorators(
    ApiCookieAuth(),
    ApiOperation({ summary: 'Forgot password' }),
    ApiResponse({
      status: 201,
      description: 'The reset password token has been successfully send to user email',
    }),
  );
}
