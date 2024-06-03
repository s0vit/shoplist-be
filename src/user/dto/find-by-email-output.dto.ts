import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class FindByEmailOutputDto {
  @ApiProperty({
    description: 'User id',
    example: '60d4b5a2c1f5f83b2c0b7c0b',
  })
  id: string | Types.ObjectId;

  @ApiProperty({
    description: 'User email',
    example: 'example@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'User login',
    example: 'example',
  })
  login: string;

  @ApiProperty({
    description: 'Is user verified',
    example: false,
  })
  isVerified: boolean;

  @ApiProperty({
    description: 'Last login date',
    example: '2021-06-24T12:00:00.000Z',
  })
  loginDate: Date;

  constructor(id: Types.ObjectId, email: string, login: string, isVerified: boolean, loginDate: Date) {
    this.id = id;
    this.email = email;
    this.login = login;
    this.isVerified = isVerified;
    this.loginDate = loginDate;
  }
}
