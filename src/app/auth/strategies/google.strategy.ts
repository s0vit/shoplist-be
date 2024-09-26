import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { GoogleResponse } from '../../../common/interfaces/token.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      passReqToCallback: true,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _req: any,
    _accessToken: string,
    _refreshToken: string,
    profile: GoogleResponse,
    done: VerifyCallback,
  ) {
    const tokens = await this.authService.validateOAuthLogin(profile);
    const user = {
      email: profile.emails[0].value,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
    done(null, user);
  }
}
