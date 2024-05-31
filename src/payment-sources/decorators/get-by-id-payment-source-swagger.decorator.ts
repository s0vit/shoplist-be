import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { PaymentSourceResponseDto } from '../dto/payment-source-response.dto';

export function GetByIdPaymentSourceSwaggerDecorator() {
  return applyDecorators(
    ApiCookieAuth(),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'The payment source id',
    }),
    ApiOperation({
      summary: 'Get a payment source by id',
      description: 'The payment source has been successfully retrieved.',
    }),
    ApiResponse({
      status: 200,
      description: 'The payment source has been successfully retrieved.',
      type: PaymentSourceResponseDto,
    }),
  );
}
