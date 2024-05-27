import { IsEmail, IsString, Length, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'User email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    example: 'Password123',
    description: 'User password',
  })
  @IsOptional()
  @IsString()
  @Length(6, 20)
  password?: string;
}
