import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthDto } from '../dto/auth.dto';

export function RegisterSwaggerDecorators() {
  return applyDecorators(
    ApiOperation({
      summary: 'Register a new user',
      description: 'The user has been successfully created.Reminder: origin is required in the headers.',
    }),
    ApiBody({ type: AuthDto }),
    ApiResponse({ status: 201, description: 'The user has been successfully created.' }),
  );
}
