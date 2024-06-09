import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { PaymentSourceOutputDto } from '../dto/payment-source-output.dto';

export function GetByIdPaymentSourceSwDec() {
  return applyDecorators(
    ApiBearerAuth(),
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
      type: PaymentSourceOutputDto,
    }),
  );
}
