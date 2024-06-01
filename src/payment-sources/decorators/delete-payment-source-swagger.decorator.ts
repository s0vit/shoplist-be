import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { PaymentSourceResponseDto } from '../dto/payment-source-response.dto';

export function DeletePaymentSourceSwaggerDecorator() {
  return applyDecorators(
    ApiCookieAuth(),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'The payment source id',
    }),
    ApiOperation({
      summary: 'Delete a payment source',
      description: 'The payment source has been successfully deleted.',
    }),
    ApiResponse({
      status: 200,
      description: 'The payment source has been successfully deleted.',
      type: PaymentSourceResponseDto,
    }),
  );
}
