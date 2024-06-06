import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ERROR_AUTH } from '../constants/auth-error.enum';

export class ResetPasswordDto {
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
