import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function LogoutSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Logout user',
      description: 'The user has been successfully logged out. Note: Requires a token in the header.',
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'The user has been successfully logged out. Note: Requires a token in the header.',
    }),
    HttpCode(200),
  );
}
