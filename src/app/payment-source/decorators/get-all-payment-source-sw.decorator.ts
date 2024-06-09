import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { PaymentSourceOutputDto } from '../dto/payment-source-output.dto';

export function GetAllPaymentSourceSwDec() {
  return applyDecorators(
    ApiBearerAuth(),
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
