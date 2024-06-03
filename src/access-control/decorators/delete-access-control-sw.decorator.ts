import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function DeleteAccessControlSwDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete access control',
      description: 'Requires a token in cookies',
    }),
    ApiCookieAuth(),
    ApiParam({
      name: 'id',
      description: 'Access control id',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: 'Delete access control response',
    }),
  );
}
