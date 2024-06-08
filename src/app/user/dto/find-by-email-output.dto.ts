import { ApiProperty } from '@nestjs/swagger';

export class FindByEmailOutputDto {
  @ApiProperty({
    description: 'User id',
    example: '60d4b5a2c1f5f83b2c0b7c0b',
  })
  _id: string;

  @ApiProperty({
    description: 'User email',
    example: 'example@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'User login',
    example: 'example',
  })
  login?: string;

  @ApiProperty({
    description: 'Is user verified',
    example: false,
  })
  isVerified?: boolean;

  @ApiProperty({
    description: 'Last login date',
    example: '2024-06-08T09:04:50.592Z',
  })
  loginDate?: Date;
}
