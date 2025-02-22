import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class PaymentSourceOrderUpdateDto {
  @IsNumber()
  @ApiProperty({
    description: 'Order of the payment source for drag and drop functionality',
    example: '2',
  })
  order: number;
}
