import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { PaymentSourceOutputDto } from '../dto/payment-source-output.dto';

export function GetAllPaymentSourceSwaggerDecorator() {
  return applyDecorators(
    ApiCookieAuth(),
    ApiOperation({
      summary: 'Get all payment sources',
      description: 'The payment sources have been successfully retrieved.',
    }),
    ApiResponse({
      status: 200,
      description: 'The payment sources have been successfully retrieved.',
      type: PaymentSourceOutputDto,
      isArray: true,
    }),
  );
}
