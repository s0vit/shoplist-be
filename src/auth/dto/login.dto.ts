import { IsEmail, IsString, Length, IsOptional } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(6, 20)
  password?: string;
}
