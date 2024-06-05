import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ConfirmOutputDto } from '../dto/confirm-output.dto';

export function ConfirmEmailSwDec() {
  return applyDecorators(
    ApiOperation({ summary: 'Confirm user registration' }),
    ApiResponse({
      status: 200,
      description: 'The user registration has been successfully confirmed.',
      type: ConfirmOutputDto,
    }),
  );
}
