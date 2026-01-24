import { applyDecorators, HttpCode } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateBudgetPlanDto } from '../dto/create-budget-plan.dto';
import { BudgetPlanResponseDto } from '../dto/budget-plan-response.dto';

export const CreateBudgetPlanSwDec = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Создать или активировать новый бюджетный план',
      description:
        'Активирует новый план, автоматически архивируя предыдущий активный план. Поддерживает ограничения по категориям и источникам платежей.',
    }),
    ApiBearerAuth(),
    HttpCode(201),
    ApiBody({ type: CreateBudgetPlanDto }),
    ApiCreatedResponse({
      description: 'План успешно создан и активирован.',
      type: BudgetPlanResponseDto,
    }),
    ApiBadRequestResponse({
      description: 'Валидация не пройдена или диапазон дат некорректен.',
    }),
    ApiUnauthorizedResponse({
      description: 'Требуется аутентификация пользователя.',
    }),
  );
