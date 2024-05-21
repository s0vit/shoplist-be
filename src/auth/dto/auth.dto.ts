import { IsEmail, IsString, Length, Matches, IsOptional } from 'class-validator';
import { ERROR_AUTH } from '../constants/auth-error.enum';

export class AuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 20)
  @Matches(/^(?=.*[0-9])(?=.*[A-Z]).*$/, {
    message: ERROR_AUTH.PASSWORD_ERROR,
  })
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^[^0-9]*$/, { message: ERROR_AUTH.LOGIN_ERROR })
  @Length(3, 30, { message: ERROR_AUTH.LOGIN_LENGTH_ERROR })
  login?: string;
}
