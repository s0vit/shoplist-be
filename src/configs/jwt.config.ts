import { ConfigService } from '@nestjs/config';

export const jwtConfig = (configService: ConfigService) => ({
  secret: configService.get<string>('REGISTER_TOKEN_KEY'),
  signOptions: { expiresIn: '1h' },
});
