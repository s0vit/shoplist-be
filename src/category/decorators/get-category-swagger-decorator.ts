import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function GetCategorySwaggerDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get users categories',
      description: 'Requires a token in cookies',
    }),
    ApiResponse({
      status: 200,
      description: 'The users categories successfully received.',
    }),
  );
}