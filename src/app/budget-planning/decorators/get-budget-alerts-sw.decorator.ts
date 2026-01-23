import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { BudgetAlertResponseDto } from '../dto/budget-alert-response.dto';

export const GetBudgetAlertsSwDec = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить уведомления по бюджетным планам',
      description:
        'Возвращает список уведомлений о достижении порогов бюджета. Можно отфильтровать результаты по конкретному плану.',
    }),
    ApiBearerAuth(),
    ApiQuery({
      name: 'planId',
      required: false,
      description: 'Идентификатор плана для фильтрации уведомлений',
    }),
    ApiOkResponse({
      description: 'Список уведомлений.',
      type: BudgetAlertResponseDto,
      isArray: true,
    }),
    ApiUnauthorizedResponse({
      description: 'Требуется аутентификация пользователя.',
    }),
  );
