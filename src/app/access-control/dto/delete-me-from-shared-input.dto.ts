import { ApiProperty } from '@nestjs/swagger';
import { IsOptionalMongoidArrayDec } from '../decorators/is-optional-mongoid-array.decorator';
import { IsMongoId } from 'class-validator';

export class DeleteMeFromSharedInputDto {
  @ApiProperty({
    example: '5f6a0c8b3e0b8f001f8e7e7c',
    description: 'Access id',
    type: String,
  })
  @IsMongoId()
  accessId: string;

  @ApiProperty({
    example: ['5f6a0c8b3e0b8f001f8e7e7c', '5f6a0c8b3e0b8f001f8e7e7d'],
    description: 'Expense that shared with me',
    type: [String],
  })
  @IsOptionalMongoidArrayDec()
  expenseIds: string[];

  @ApiProperty({
    example: ['5f6a0c8b3e0b8f001f8e7e7c', '5f6a0c8b3e0b8f001f8e7e7d'],
    description: 'Categories that shared with me',
    type: [String],
  })
  @IsOptionalMongoidArrayDec()
  categoryIds: string[];

  @ApiProperty({
    example: ['5f6a0c8b3e0b8f001f8e7e7c', '5f6a0c8b3e0b8f001f8e7e7d'],
    description: 'Payment sources that shared with me',
    type: [String],
  })
  @IsOptionalMongoidArrayDec()
  paymentSourceIds: string[];
}
