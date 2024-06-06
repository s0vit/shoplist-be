import { BadRequestException, Body, Controller, Delete, Get, Post, Query, Req, Res } from '@nestjs/common';
import { AuthInputDto } from './dto/auth-input.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LoginInputDto } from './dto/login-input.dto';
import { RefreshInputDto } from './dto/refresh-input.dto';
import { COOKIE_SETTINGS } from './constants/auth-constants';
import { ERROR_AUTH } from './constants/auth-error.enum';
import { ApiTags } from '@nestjs/swagger';
import { RegisterSwDec } from './decorators/register-sw.decorator';
import { ConfirmEmailSwDec } from './decorators/confirm-email-sw.decorator';
import { LoginSwDec } from './decorators/login-sw.decorator';
import { RefreshTokenSwDec } from './decorators/refresh-token-sw.decorator';
import { LogoutSwDec } from './decorators/logout-sw.decorator';
import { LoginOutputDto } from './dto/login-output.dto';
import { ConfirmOutputDto } from './dto/confirm-output.dto';
import { ReRequestVerificationTokenSwDec } from './decorators/re-request-validate-token-sw.decorator';
import { ForgotPasswordSwDec } from './decorators/forgot-password-sw.decorator';
import { ResetPasswordSwDec } from './decorators/reset-password-sw.decorator';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RegisterSwDec()
  @Post('register')
  async register(@Body() dto: AuthInputDto, @Req() req: Request): Promise<void> {
    const origin = req.headers['origin'];
    return this.authService.register(dto, origin);
  }

  @ConfirmEmailSwDec()
  @Get('confirm')
  async confirm(@Query('token') token: string): Promise<ConfirmOutputDto> {
    return await this.authService.confirmRegistration(token);
  }

  @ReRequestVerificationTokenSwDec()
  @Post('request-confirm')
  async reRequestVerification(@Req() req: Request): Promise<void> {
    const accessToken = req.cookies['accessToken'];
    const origin = req.headers['origin'];
    return await this.authService.requestConfirm(accessToken, origin);
  }

  @ForgotPasswordSwDec()
  @Post('forgot-password')
  async forgotPassword(@Req() req: Request): Promise<void> {
    const origin = req.headers['origin'];
    const token = req.cookies['accessToken'];
    return await this.authService.forgotPassword(token, origin);
  }

  @ResetPasswordSwDec()
  @Post('reset-password')
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Req() req: Request,
    @Query('token') passwordResetToken: string,
  ): Promise<void> {
    const accessToken = req.cookies['accessToken'];
    return await this.authService.resetPassword(accessToken, dto.password, passwordResetToken);
  }

  @LoginSwDec()
  @Post('login')
  async login(
    @Body() dto: LoginInputDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginOutputDto> {
    if (dto.email && dto.password) {
      const result = await this.authService.login(dto.email, dto.password);
      res.cookie('accessToken', result.accessToken, COOKIE_SETTINGS.ACCESS_TOKEN);
      return result;
    } else if (req.cookies && req.cookies['accessToken']) {
      const token = req.cookies['accessToken'];
      return await this.authService.loginWithCookies(token);
    } else {
      throw new BadRequestException(ERROR_AUTH.INVALID_AUTHENTICATION_CREDENTIALS);
    }
  }

  @RefreshTokenSwDec()
  @Post('refresh')
  async refresh(@Body() dto: RefreshInputDto, @Res({ passthrough: true }) res: Response): Promise<RefreshInputDto> {
    const result = await this.authService.validateToken(dto.refreshToken);
    res.cookie('accessToken', result.accessToken, COOKIE_SETTINGS.ACCESS_TOKEN);
    return { refreshToken: result.refreshToken };
  }

  @LogoutSwDec()
  @Delete('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    if (req.cookies && req.cookies['accessToken']) {
      const accessToken = req.cookies['accessToken'];
      await this.authService.logout(accessToken);
      res.clearCookie('accessToken');
    } else {
      throw new BadRequestException(ERROR_AUTH.AUTH_ERROR_NO_TOKEN);
    }
  }
}
