import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseOutputDto } from './expense-output.dto';

export class ReceiptParseResponseDto {
  @ApiProperty({ type: ExpenseOutputDto })
  expense: ExpenseOutputDto;

  @ApiPropertyOptional({
    description: 'Пояснение от модели, почему были выбраны такие значения.',
    example: 'Подсумма совпала с категорией "Продукты", выбрана карта как источник оплаты.',
  })
  reason?: string | null;
}
