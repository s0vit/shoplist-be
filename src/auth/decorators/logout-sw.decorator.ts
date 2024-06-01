import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function LogoutSwDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Logout user',
      description: 'The user has been successfully logged out. Note: Requires a token in cookies.',
    }),
    ApiCookieAuth('accessToken'),
    ApiResponse({
      status: 200,
      description: 'The user has been successfully logged out. Note: Requires a token in cookies.',
    }),
    HttpCode(200),
  );
}
