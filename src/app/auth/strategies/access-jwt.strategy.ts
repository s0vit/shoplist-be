import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../../../common/interfaces/token.interface';
import { ERROR_AUTH } from '../constants/auth-error.enum';

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_KEY'),
    });
  }

  async validate({ userId, email, isVerified }: TokenPayload) {
    if (!isVerified) {
      throw new UnauthorizedException(ERROR_AUTH.VERIFIED_USER_ERROR);
    }
    return { userId, email };
  }
}
