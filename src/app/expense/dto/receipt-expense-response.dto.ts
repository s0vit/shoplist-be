import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseInputDto } from './expense-input.dto';

export class ReceiptParseResponseDto {
  @ApiProperty({ type: ExpenseInputDto })
  expenseInput: ExpenseInputDto;

  @ApiPropertyOptional({
    description: 'Пояснение от модели, почему были выбраны такие значения.',
    example: 'Подсумма совпала с категорией "Продукты", выбрана карта как источник оплаты.',
  })
  reason?: string | null;
}
