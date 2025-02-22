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
import { CategoryUpdateOrderDto } from '../dto/category-update-order.dto';

export function UpdateCategoryOrderSwDec() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      type: 'string',
      description: 'The order id',
    }),
    ApiBody({
      description: 'The new order',
      type: CategoryUpdateOrderDto,
    }),
    ApiOperation({
      summary: 'Update a order',
      description: 'The order has been successfully updated.',
    }),
    ApiOkResponse({
      description: 'The order has been successfully updated.',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
    }),
  );
}
