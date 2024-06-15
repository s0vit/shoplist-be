import { ApiProperty } from '@nestjs/swagger';

export class AccessControlOutputDto {
  @ApiProperty({
    example: '5f6a0c8b3e0b8f001f8e7e7c',
    description: 'Access control id',
    type: String,
  })
  _id: string;

  @ApiProperty({
    example: '5f6a0c8b3e0b8f001f8e7e7c',
    description: 'Owner id',
    type: String,
  })
  ownerId: string;

  @ApiProperty({
    example: '5f6a0c8b3e0b8f001f8e7e7c',
    description: 'User id',
    type: String,
  })
  sharedWith: string;

  @ApiProperty({
    example: ['5f6a0c8b3e0b8f001f8e7e7c'],
    description: 'Owner id',
    type: [String],
  })
  expenseIds: string[];

  @ApiProperty({
    example: ['5f6a0c8b3e0b8f001f8e7e7c'],
    description: 'Category ids',
    type: [String],
  })
  categoryIds: string[];

  @ApiProperty({
    example: ['5f6a0c8b3e0b8f001f8e7e7c'],
    description: 'Payment source ids',
    type: [String],
  })
  paymentSourceIds: string[];
}
