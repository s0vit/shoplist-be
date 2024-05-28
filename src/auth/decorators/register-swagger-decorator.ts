import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function RegisterSwaggerDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Register a new user',
      description: 'The user has been successfully created.Reminder: origin is required in the headers.',
    }),
    ApiResponse({ status: 201, description: 'The user has been successfully created.' }),
  );
}
