import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdateBudgetPlanDto } from '../dto/update-budget-plan.dto';
import { BudgetPlanResponseDto } from '../dto/budget-plan-response.dto';

export const UpdateBudgetPlanSwDec = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Обновить активный бюджетный план',
      description:
        'Позволяет корректировать лимиты, даты, описание и распределение по категориям/источникам. Перезапускает уведомления при изменении ограничений.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'planId',
      description: 'Идентификатор плана, который необходимо обновить',
    }),
    ApiBody({ type: UpdateBudgetPlanDto }),
    ApiOkResponse({
      description: 'План обновлён. Возвращает актуальный прогресс.',
      type: BudgetPlanResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Неверные параметры обновления.',
    }),
    ApiUnauthorizedResponse({
      description: 'Требуется аутентификация пользователя.',
    }),
  );
