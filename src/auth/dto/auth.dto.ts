import { IsEmail, IsString, Length, Matches, IsOptional } from 'class-validator';
import { ERROR_AUTH } from '../constants/auth-error.enum';
import { ApiProperty } from '@nestjs/swagger';

export class AuthDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'User email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password123',
    description: 'User password',
  })
  @IsString()
  @Length(6, 20)
  @Matches(/^(?=.*[0-9])(?=.*[A-Z]).*$/, {
    message: ERROR_AUTH.PASSWORD_ERROR,
  })
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'User email without domain',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[^0-9]*$/, { message: ERROR_AUTH.LOGIN_ERROR })
  @Length(3, 30, { message: ERROR_AUTH.LOGIN_LENGTH_ERROR })
  login?: string;
}
