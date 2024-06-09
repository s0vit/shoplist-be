import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LoginOutputDto } from '../dto/login-output.dto';
import { LoginInputDto } from '../dto/login-input.dto';

export function LoginSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Login user',
      description: 'Requires email and password.',
    }),
    ApiBody({ type: LoginInputDto }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'The user has been successfully logged in',
      type: LoginOutputDto,
    }),
    HttpCode(200),
  );
}
