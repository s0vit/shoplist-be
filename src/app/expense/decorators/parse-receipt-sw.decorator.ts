import { applyDecorators, HttpCode } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ReceiptParseResponseDto } from '../dto/receipt-expense-response.dto';

export function ParseReceiptSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Распознать чек с помощью Gemini',
      description: `Принимает фотографию чека, автоматически подбирает категории, источники трат и валюту пользователя, и сразу сохраняет трату в базе.

Требуется:
- токен авторизации в заголовке
- файл чека (поле receipt) в multipart/form-data`,
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    HttpCode(200),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          receipt: {
            type: 'string',
            format: 'binary',
            description: 'Изображение чека (JPEG, PNG или WEBP).',
          },
        },
        required: ['receipt'],
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Сохраненная трата и краткое пояснение от модели.',
      type: ReceiptParseResponseDto,
    }),
    ApiResponse({
      status: 400,
      description: 'Ошибка валидации входных данных (невалидный файл).',
    }),
    ApiResponse({
      status: 422,
      description: 'Модель не смогла распознать чек или вернула некорректные данные.',
    }),
    ApiResponse({
      status: 500,
      description: 'Системная ошибка либо проблемы с ключом Gemini.',
    }),
  );
}
