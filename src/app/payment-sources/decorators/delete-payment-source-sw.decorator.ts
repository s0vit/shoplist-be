import { ApiCookieAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { PaymentSourceOutputDto } from '../dto/payment-source-output.dto';

export function DeletePaymentSourceSwDec() {
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
      type: PaymentSourceOutputDto,
    }),
  );
}
