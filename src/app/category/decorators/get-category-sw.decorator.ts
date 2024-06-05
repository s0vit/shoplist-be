import { applyDecorators } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetCategorySwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get users categories',
      description: 'Requires a token in cookies',
    }),
    ApiCookieAuth(),
    ApiResponse({
      status: 200,
      description: 'The users categories successfully received.',
      // ToDo: add type response
    }),
  );
}
