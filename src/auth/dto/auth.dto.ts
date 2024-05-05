import { IsEmail, IsString, Length, Matches, IsOptional } from 'class-validator';

export class AuthDto {
  @IsEmail()
  email: string;

  @IsString()
  @Length(6, 20)
  password: string;

  @IsOptional()
  @IsString()
  @Matches(/^[^0-9]*$/, { message: 'login must not be numeric' })
  @Length(3, 30, { message: 'login length must be at least 3 characters' })
  login?: string;
}
