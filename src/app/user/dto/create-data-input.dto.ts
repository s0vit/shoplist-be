import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDataInputDto {
  @ApiProperty({
    description: 'Array Categories',
    example: ['Food', 'Transport', 'Clothes', 'Entertainment', 'Health', 'Home'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  categories: string[];

  @ApiProperty({
    description: 'Array Payment Sources',
    example: ['Bank_1', 'Bank_2', 'Cash', 'Wallet'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  paymentSources: string[];
}
