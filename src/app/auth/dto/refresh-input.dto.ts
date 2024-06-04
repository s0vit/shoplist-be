import { IsJWT } from 'class-validator';
import { ERROR_AUTH } from '../constants/auth-error.enum';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshInputDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjI5MzQwMzIyLCJleHAiOjE2MjkzNDAzMjJ9.1J7Z',
    description: 'Refresh token',
  })
  @IsJWT({ message: ERROR_AUTH.AUTH_ERROR_TOKEN })
  refreshToken: string;
}
