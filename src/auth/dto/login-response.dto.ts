import { UserDocument } from '../models/user.model';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Email user',
  })
  email: string;

  @ApiProperty({
    example: 'Bob',
    description: 'Login user',
  })
  login: string;

  @ApiProperty({
    example: 'true',
    description: 'Is the user verified or not',
  })
  isVerified: boolean;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjI5MzQwMzIyLCJleHAiOjE2MjkzNDAzMjJ9.1J7Z',
    description: 'AccessToken token',
  })
  accessToken: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjI5MzQwMzIyLCJleHAiOjE2MjkzNDAzMjJ9.1J7Z',
    description: 'Refresh token',
  })
  refreshToken: string;

  constructor(user: UserDocument) {
    this.email = user.email;
    this.login = user.login;
    this.isVerified = user.isVerified;
    this.accessToken = user.accessToken;
    this.refreshToken = user.refreshToken;
  }
}
