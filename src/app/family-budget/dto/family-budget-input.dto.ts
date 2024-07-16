import { Types } from 'mongoose';
import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFamilyBudgetDto {
  @ApiProperty({
    example: 'Smith Family Budget',
    description: 'Name of the family budget',
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: ['60c72b2f9b1e8e1f88f4e1f4', '60c72b3a9b1e8e1f88f4e1f5'],
    description: 'Array of user IDs who are members of the family budget, can be empty',
  })
  @IsOptional()
  @IsArray()
  readonly members: Types.ObjectId[];
}
