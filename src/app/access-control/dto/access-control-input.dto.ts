import { IsOptionalMongoidArrayDec } from '../decorators/is-optional-mongoid-array.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class AccessControlInputDto {
  @ApiProperty({
    example: ['5f6a0c8b3e0b8f001f8e7e7c'],
    description: 'User id',
    type: [String],
  })
  @IsOptionalMongoidArrayDec()
  sharedWith: string[];

  @ApiProperty({
    example: ['5f6a0c8b3e0b8f001f8e7e7c', '5f6a0c8b3e0b8f001f8e7e7d'],
    description: 'Expense ids',
    type: [String],
  })
  @IsOptionalMongoidArrayDec()
  expenseIds: string[];

  @ApiProperty({
    example: ['5f6a0c8b3e0b8f001f8e7e7c', '5f6a0c8b3e0b8f001f8e7e7d'],
    description: 'Category ids',
    type: [String],
  })
  @IsOptionalMongoidArrayDec()
  categoryIds: string[];

  @ApiProperty({
    example: ['5f6a0c8b3e0b8f001f8e7e7c', '5f6a0c8b3e0b8f001f8e7e7d'],
    description: 'Payment source ids',
    type: [String],
  })
  @IsOptionalMongoidArrayDec()
  paymentSourceIds: string[];
}
