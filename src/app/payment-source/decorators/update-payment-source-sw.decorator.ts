import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { PaymentSourceInputDto } from '../dto/payment-source-input.dto';
import { PaymentSourceOutputDto } from '../dto/payment-source-output.dto';

export function UpdatePaymentSourceSwDec() {
  return applyDecorators(
    ApiCookieAuth(),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'The payment source id',
    }),
    ApiBody({
      description: 'The payment source input',
      type: PaymentSourceInputDto,
    }),
    ApiOperation({
      summary: 'Update a payment source',
      description: 'The payment source has been successfully updated.',
    }),
    ApiResponse({
      status: 200,
      description: 'The payment source has been successfully updated.',
      type: PaymentSourceOutputDto,
    }),
  );
}
