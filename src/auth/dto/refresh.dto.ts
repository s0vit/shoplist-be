import { IsJWT } from 'class-validator';
import { ERROR_AUTH } from '../constants/auth-constants.enum';

export class RefreshDto {
  @IsJWT({ message: ERROR_AUTH.AUTH_ERROR_TOKEN })
  refreshToken: string;
}
