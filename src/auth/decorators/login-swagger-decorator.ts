import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from '../dto/login.dto';
import { LoginOutputDto } from '../dto/login-output.dto';

export function LoginSwaggerDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Login user',
      description: 'Requires a token in cookies or email and password.',
    }),
    ApiBody({ type: LoginDto }),
    ApiCookieAuth('accessToken'),
    ApiResponse({
      status: 200,
      description: 'The user has been successfully logged in. Note: Requires a token in cookies.',
      type: LoginOutputDto,
    }),
    HttpCode(200),
  );
}
