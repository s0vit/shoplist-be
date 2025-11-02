import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class TestEmailDto {
  @ApiProperty({
    description: 'Email address to receive the test message',
    example: 'demo@example.com',
  })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Plain text body for the test email',
    example: 'This is a test message from ShopList.',
  })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({
    description: 'HTML body for the test email',
    example: '<p>This is a <strong>test</strong> message from ShopList.</p>',
  })
  @IsOptional()
  @IsString()
  html?: string;
}
