import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ERROR_AUTH } from '../constants/auth-constants.enum';

export class RefreshDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/, {
    message: ERROR_AUTH.AUTH_ERROR_TOKEN,
  })
  refreshToken: string;
}
