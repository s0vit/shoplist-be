import { ApiProperty } from '@nestjs/swagger';

export class RefreshOutputDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjI5MzQwMzIyLCJleHAiOjE2MjkzNDAzMjJ9.1J7Z',
    description: 'Access token',
  })
  accessToken: string;

  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjI5MzQwMzIyLCJleHAiOjE2MjkzNDAzMjJ9.1J7Z',
    description: 'Refresh token',
  })
  refreshToken: string;
}
