import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse, getSchemaPath } from '@nestjs/swagger';
import { BudgetPlanResponseDto } from '../dto/budget-plan-response.dto';

export const GetCurrentBudgetPlanSwDec = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Получить активный бюджетный план',
      description:
        'Возвращает текущий план с прогрессом по категориям и источникам. Если активного плана нет, возвращает null.',
    }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'Текущий план или null, если активного плана нет.',
      schema: {
        oneOf: [{ $ref: getSchemaPath(BudgetPlanResponseDto) }, { type: 'null' }],
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Требуется аутентификация пользователя.',
    }),
  );
