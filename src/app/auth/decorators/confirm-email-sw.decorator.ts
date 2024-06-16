import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { ConfirmOutputDto } from '../dto/confirm-output.dto';
import { ERROR_AUTH } from '../constants/auth-error.enum';

export function ConfirmEmailSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Confirm user registration',
      description: `
        Requires:
        - token in Query`,
    }),
    ApiQuery({
      name: 'token',
      type: String,
      description: `
      token from the confirmation email`,
      example:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImV4YW1wbGVAZ21haWwuY29tIiwiaWF0IjoxNzE4NTI5MTc1LCJleHAiOjE3MTg1MzI3NzV9.bt37MOCVzAEs3q3CInW-BTrSZvI6EmVxk562Q8P3gHA',
    }),
    ApiResponse({
      status: 200,
      description: 'The user registration has been successfully confirmed.',
      type: ConfirmOutputDto,
    }),
    ApiResponse({
      status: 409,
      description: `
      ConflictException: ${ERROR_AUTH.CONFIRM_REGISTRATION_CONFLICT}`,
    }),
    ApiResponse({
      status: 400,
      description: `
      BadRequestException: ${ERROR_AUTH.AUTH_ERROR_TOKEN}`,
    }),
    ApiResponse({
      status: 500,
      description: `
      HttpException: ${ERROR_AUTH.CONFIRM_REGISTRATION_ERROR}`,
    }),
  );
}
