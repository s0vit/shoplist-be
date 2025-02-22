import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaymentSourceOrderUpdateDto } from '../dto/payment-source-order-update.dto';
import { PaymentSourceOutputDto } from '../dto/payment-source-output.dto';

export function UpdateOrderPaymentSourceSwDec() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'Payment source id',
    }),
    ApiBody({
      description: 'The new order',
      type: PaymentSourceOrderUpdateDto,
    }),
    ApiOperation({
      summary: 'Update a order',
      description: 'The order has been successfully updated.',
    }),
    ApiOkResponse({
      description: 'The order has been successfully updated.',
      type: PaymentSourceOutputDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
    }),
  );
}
