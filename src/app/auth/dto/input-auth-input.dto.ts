import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { ERROR_AUTH } from '../constants/auth-error.enum';
import { ApiProperty } from '@nestjs/swagger';

export class InputAuthInputDto {
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
}
