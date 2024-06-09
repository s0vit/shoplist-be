import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { PaymentSourceOutputDto } from '../dto/payment-source-output.dto';
import { PaymentSourceInputDto } from '../dto/payment-source-input.dto';

export function CreatePaymentSourceSwDec() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a new payment source',
      description: 'The payment source has been successfully created.',
    }),
    ApiBody({
      type: PaymentSourceInputDto,
    }),
    ApiResponse({
      status: 201,
      description: 'The payment source has been successfully created.',
      type: PaymentSourceOutputDto,
    }),
  );
}
