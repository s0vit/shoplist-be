import { ApiProperty } from '@nestjs/swagger';
import { UserDocument } from '../models/user.model';

export class ConfirmResponseDto {
  @ApiProperty({
    example: 'example@gmail.com',
    description: 'Login email',
  })
  email: string;

  @ApiProperty({
    example: 'Bob',
    description: 'Login user',
  })
  login: string;

  @ApiProperty({
    example: '2021-08-01T00:00:00.000Z',
    description: 'Date of registration of the',
  })
  createdAt: Date;

  constructor(user: UserDocument) {
    this.email = user.email;
    this.login = user.login;
    this.createdAt = user.createdAt;
  }
}
