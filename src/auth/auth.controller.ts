import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { LoginDto } from './dto/login.dto';
import { COOKIE_SETTINGS, ERROR_AUTH } from './constants/auth-constants.enum';
import { RefreshDto } from './dto/refresh.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: AuthDto, @Headers('origin') origin: string) {
    return this.authService.register(dto, origin);
  }

  @Get('confirm')
  async confirm(@Query('token') token: string) {
    return await this.authService.confirmRegistration(token);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (dto.email && dto.password) {
      const result = await this.authService.login(dto.email, dto.password);
      res.cookie('accessToken', result.accessToken, COOKIE_SETTINGS.ACCESS_TOKEN);
      return { refreshToken: result.refreshToken };
    } else if (req.cookies && req.cookies['accessToken']) {
      const token = req.cookies['accessToken'];
      return await this.authService.loginWithCookies(token);
    } else {
      throw new BadRequestException(ERROR_AUTH.INVALID_AUTHENTICATION_CREDENTIALS);
    }
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.validateToken(dto.refreshToken);
    res.cookie('accessToken', result.accessToken, COOKIE_SETTINGS.ACCESS_TOKEN);
    return { refreshToken: result.refreshToken };
  }

  @HttpCode(200)
  @Delete('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (req.cookies && req.cookies['accessToken']) {
      const accessToken = req.cookies['accessToken'];
      await this.authService.logout(accessToken);
      res.clearCookie('accessToken');
    } else {
      throw new BadRequestException(ERROR_AUTH.AUTH_ERROR_NO_TOKEN);
    }
  }
}
