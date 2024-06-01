import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class PaymentSourceInputDto {
  @ApiProperty({
    example: 'Bank A',
    description: 'Payment source title',
  })
  @IsString()
  @Length(3, 100, { message: 'Title must be between 3 and 100 characters' })
  title: string;

  @ApiProperty({
    example: 'Comments',
    description: 'Some extra information',
  })
  @IsOptional()
  @IsString({ message: 'Comments must be a string' })
  comments: string;

  @ApiProperty({
    example: '#00fa58',
    description: 'Color of the payment source, used for decoration in the UI',
  })
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a hex color' })
  color: string;
}
