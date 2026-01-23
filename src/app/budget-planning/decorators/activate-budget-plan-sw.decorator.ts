import { applyDecorators, HttpCode } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ActivateBudgetPlanDto } from '../dto/activate-budget-plan.dto';
import { BudgetPlanResponseDto } from '../dto/budget-plan-response.dto';

export const ActivateBudgetPlanSwDec = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Повторно активировать сохранённый план',
      description:
        'Создаёт новый активный план на основе истории. Можно переопределить даты периода. Предыдущий активный план будет архивирован.',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'planId',
      description: 'Идентификатор архивного плана, который используется как шаблон',
    }),
    ApiBody({ type: ActivateBudgetPlanDto }),
    HttpCode(201),
    ApiCreatedResponse({
      description: 'Создан новый активный план на основе шаблона.',
      type: BudgetPlanResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Переданы некорректные даты или план уже активен.',
    }),
    ApiUnauthorizedResponse({
      description: 'Требуется аутентификация пользователя.',
    }),
  );
