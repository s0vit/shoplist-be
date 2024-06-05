import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginOutputDto } from '../dto/login-output.dto';
import { LoginInputDto } from '../dto/login-input.dto';

export function LoginSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Login user',
      description: 'Requires a token in cookies or email and password.',
    }),
    ApiBody({ type: LoginInputDto }),
    ApiCookieAuth('accessToken'),
    ApiResponse({
      status: 200,
      description: 'The user has been successfully logged in. Note: Requires a token in cookies.',
      type: LoginOutputDto,
    }),
    HttpCode(200),
  );
}
