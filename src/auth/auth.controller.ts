import { BadRequestException, Body, Controller, Delete, Get, Post, Query, Req, Res } from '@nestjs/common';
import { InputAuthDto } from './dto/input-auth.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { COOKIE_SETTINGS } from './constants/auth-constants';
import { ERROR_AUTH } from './constants/auth-error.enum';
import { ApiTags } from '@nestjs/swagger';
import { RegisterSwaggerDecorators } from './decorators/register-swagger-decorator';
import { ConfirmEmailSwaggerDecorators } from './decorators/confirm-email-swagger-decorator';
import { LoginSwaggerDecorators } from './decorators/login-swagger-decorator';
import { RefreshTokenSwaggerDecorator } from './decorators/refresh-token-swagger-decorator';
import { LogoutSwaggerDecorator } from './decorators/logout-swagger-decorator';
import { LoginResponseDto } from './dto/login-response.dto';
import { ConfirmResponseDto } from './dto/confirm-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @RegisterSwaggerDecorators()
  @Post('register')
  async register(@Body() dto: InputAuthDto, @Req() req: Request): Promise<void> {
    const origin = req.headers['origin'];
    return this.authService.register(dto, origin);
  }

  @ConfirmEmailSwaggerDecorators()
  @Get('confirm')
  async confirm(@Query('token') token: string): Promise<ConfirmResponseDto> {
    return await this.authService.confirmRegistration(token);
  }

  @LoginSwaggerDecorators()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseDto> {
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

  @RefreshTokenSwaggerDecorator()
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto, @Res({ passthrough: true }) res: Response): Promise<RefreshDto> {
    const result = await this.authService.validateToken(dto.refreshToken);
    res.cookie('accessToken', result.accessToken, COOKIE_SETTINGS.ACCESS_TOKEN);
    return { refreshToken: result.refreshToken };
  }

  @LogoutSwaggerDecorator()
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
