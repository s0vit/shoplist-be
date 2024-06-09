import { IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QuantityInputDto {
  @ApiProperty({
    description: 'Quantity of expenses',
    example: 25,
  })
  @IsPositive()
  quantity: number;
}
