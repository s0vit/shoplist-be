import { IsOptionalMongoidArray } from '../decorators/is-optional-mongoid-array';
import { ApiProperty } from '@nestjs/swagger';

export class AccessControlInputDto {
  @ApiProperty({
    example: ['5f6a0c8b3e0b8f001f8e7e7c'],
    description: 'User id',
    type: [String],
  })
  @IsOptionalMongoidArray()
  sharedWith: string[];

  @ApiProperty({
    example: ['5f6a0c8b3e0b8f001f8e7e7c', '5f6a0c8b3e0b8f001f8e7e7d'],
    description: 'Expense ids',
    type: [String],
  })
  @IsOptionalMongoidArray()
  expenseIds: string[];

  @ApiProperty({
    example: ['5f6a0c8b3e0b8f001f8e7e7c', '5f6a0c8b3e0b8f001f8e7e7d'],
    description: 'Category ids',
    type: [String],
  })
  @IsOptionalMongoidArray()
  categoryIds: string[];

  @ApiProperty({
    example: ['5f6a0c8b3e0b8f001f8e7e7c', '5f6a0c8b3e0b8f001f8e7e7d'],
    description: 'Payment source ids',
    type: [String],
  })
  @IsOptionalMongoidArray()
  paymentSourceIds: string[];
}
