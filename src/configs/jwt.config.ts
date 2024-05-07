import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const jwtConfig = async (configService: ConfigService): Promise<JwtModuleOptions> => ({
  secret: configService.get<string>('TOKEN_KEY'),
  signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN') },
});
