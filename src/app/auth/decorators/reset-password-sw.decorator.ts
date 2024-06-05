import { ApiCookieAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function ResetPasswordSwDec() {
  return applyDecorators(
    ApiCookieAuth(),
    ApiQuery({ name: 'token', type: 'string', required: true }),
    ApiOperation({ summary: 'Reset password' }),
    ApiResponse({
      status: 200,
      description: 'The password has been successfully reset',
    }),
  );
}
