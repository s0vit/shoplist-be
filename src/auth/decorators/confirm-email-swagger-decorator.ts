import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ConfirmResponseDto } from '../dto/confirm-response.dto';

export function ConfirmEmailSwaggerDecorators() {
  return applyDecorators(
    ApiOperation({ summary: 'Confirm user registration' }),
    ApiResponse({
      status: 200,
      description: 'The user registration has been successfully confirmed.',
      type: ConfirmResponseDto,
    }),
  );
}