import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { BudgetPlanResponseDto } from '../dto/budget-plan-response.dto';

export const GetBudgetHistorySwDec = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить историю бюджетных планов',
      description: 'Возвращает архивные и удалённые планы, отсортированные по дате начала периода.',
    }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'Список архивных/удалённых планов.',
      type: BudgetPlanResponseDto,
      isArray: true,
    }),
    ApiUnauthorizedResponse({
      description: 'Требуется аутентификация пользователя.',
    }),
  );
