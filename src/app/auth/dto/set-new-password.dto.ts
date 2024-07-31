import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { ERROR_AUTH } from '../constants/auth-error.enum';

export class SetNewPasswordDto {
  @ApiProperty({
    example: 'Password123',
    description: 'Old password',
  })
  @IsString()
  @Length(6, 20)
  @Matches(/^(?=.*[0-9])(?=.*[A-Z]).*$/, {
    message: ERROR_AUTH.PASSWORD_ERROR,
  })
  oldPassword: string;

  @ApiProperty({
    example: 'Password123',
    description: 'New password',
  })
  @IsString()
  @Length(6, 20)
  @Matches(/^(?=.*[0-9])(?=.*[A-Z]).*$/, {
    message: ERROR_AUTH.PASSWORD_ERROR,
  })
  newPassword: string;
}
