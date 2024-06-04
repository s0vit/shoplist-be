import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class FindByEmailInputDto {
  @ApiProperty({
    description: 'User email',
    example: 'example@gmail.com',
  })
  @IsEmail()
  email: string;
}
