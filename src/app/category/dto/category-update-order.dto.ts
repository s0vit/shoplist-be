import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CategoryUpdateOrderDto {
  @IsNumber()
  @ApiProperty({
    description: 'Order of the category for drag and drop functionality',
    example: '2',
  })
  order: number;
}
