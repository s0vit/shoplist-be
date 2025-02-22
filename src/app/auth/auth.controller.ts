import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CustomRequest, GoogleRequest } from 'src/common/interfaces/token.interface';
import { AccessJwtGuard } from 'src/guards/access-jwt.guard';
import { AuthService } from './auth.service';
import { ERROR_AUTH } from './constants/auth-error.enum';
import { ConfirmEmailSwDec } from './decorators/confirm-email-sw.decorator';
import { ForgotPasswordSwDec } from './decorators/forgot-password-sw.decorator';
import { LoginSwDec } from './decorators/login-sw.decorator';
import { LogoutSwDec } from './decorators/logout-sw.decorator';
import { ReRequestVerificationTokenSwDec } from './decorators/re-request-validate-token-sw.decorator';
import { RefreshTokenSwDec } from './decorators/refresh-token-sw.decorator';
import { RegisterSwDec } from './decorators/register-sw.decorator';
import { ResetPasswordSwDec } from './decorators/reset-password-sw.decorator';
import { SetNewPasswordSwDec } from './decorators/set-new-password-sw.decorator';
import { AuthInputDto } from './dto/auth-input.dto';
import { ConfirmOutputDto } from './dto/confirm-output.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginInputDto } from './dto/login-input.dto';
import { LoginOutputDto } from './dto/login-output.dto';
import { RefreshInputDto } from './dto/refresh-input.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SetNewPasswordDto } from './dto/set-new-password.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RegisterSwDec()
  @Post('register')
  async register(@Body() dto: AuthInputDto, @Req() req: Request): Promise<string> {
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
    const accessToken = req.headers['authorization']?.split(' ')?.[1];
    const origin = req.headers['origin'];

    return await this.authService.requestConfirm(accessToken, origin);
  }

  @ForgotPasswordSwDec()
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request): Promise<void> {
    const origin = req.headers['origin'];
    const email = dto.email;

    return await this.authService.forgotPassword(email, origin);
  }

  @ResetPasswordSwDec()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto, @Query('token') passwordResetToken: string): Promise<void> {
    return await this.authService.resetPassword(dto.password, passwordResetToken);
  }

  @LoginSwDec()
  @Post('login')
  async login(@Body() dto: LoginInputDto): Promise<LoginOutputDto> {
    if (dto.email && dto.password) {
      return await this.authService.login(dto.email, dto.password);
    } else {
      throw new BadRequestException(ERROR_AUTH.INVALID_AUTHENTICATION_CREDENTIALS);
    }
  }

  @RefreshTokenSwDec()
  @Post('refresh')
  async refresh(@Body() dto: RefreshInputDto): Promise<LoginOutputDto> {
    return await this.authService.validateToken(dto.refreshToken);
  }

  @LogoutSwDec()
  @Delete('logout')
  async logout(@Req() req: Request): Promise<void> {
    const accessToken = req.headers['authorization']?.split(' ')?.[1];
    if (!accessToken) throw new BadRequestException(ERROR_AUTH.AUTH_ERROR_NO_TOKEN);
    await this.authService.logout(accessToken);
  }

  @UseGuards(AccessJwtGuard)
  @SetNewPasswordSwDec()
  @Put('change-password')
  async changePassword(@Body() dto: SetNewPasswordDto, @Req() req: CustomRequest): Promise<void> {
    const userId = req.user.userId;

    return await this.authService.changePassword(userId, dto.oldPassword, dto.newPassword);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route is left empty; Passport handles the redirect
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: GoogleRequest, @Res() res: Response) {
    // sending html page with script to store jwt in local storage as frontend will handle the rest
    res.send(
      `<html lang="en">
        <head>
        <title>Redirect</title>
          <script>
            localStorage.setItem('accessToken', '${req.user.accessToken}');
            localStorage.setItem('refreshToken', '${req.user.refreshToken}');
            window.location.href = '/';
          </script>
        </head>
        <body>
          <p>Redirecting...</p>
        </body>
      </html>`,
    );
  }
}
