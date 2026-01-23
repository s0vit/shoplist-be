import { applyDecorators, HttpCode } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export const DeleteBudgetPlanSwDec = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Удалить (архивировать) бюджетный план',
      description:
        'Помечает план как удалённый и убирает его из активных. История остаётся доступной через список планов.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'planId',
      description: 'Идентификатор удаляемого плана',
    }),
    HttpCode(204),
    ApiNoContentResponse({
      description: 'План удалён или уже был помечен как удалённый.',
    }),
    ApiUnauthorizedResponse({
      description: 'Требуется аутентификация пользователя.',
    }),
  );
