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
import { CategoryOutputDto } from '../dto/category-output.dto';

export function UpdateCategoryOrderSwDec() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiParam({
      name: 'categoryId',
      type: 'string',
      description: 'The category id',
    }),
    ApiBody({
      description: 'The new order',
      type: CategoryUpdateOrderDto,
    }),
    ApiOperation({
      summary: 'Update an order',
      description: 'The order has been successfully updated.',
    }),
    ApiOkResponse({
      description: 'The order has been successfully updated.',
      type: CategoryOutputDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
    }),
  );
}
