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
import { ERROR_AUTH } from './constants/auth-constants.enum';

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

  @Get('refresh')
  async refresh(@Req() req: Request) {
    if (req.cookies && req.cookies['accessToken']) {
      const token = req.cookies['accessToken'];
      return this.authService.loginWithCookies(token);
    } else {
      throw new BadRequestException(ERROR_AUTH.TOKEN_ERROR);
    }
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (dto.email && dto.password) {
      const result = await this.authService.login(dto.email, dto.password);
      res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: false });
      return result;
    } else if (req.cookies && req.cookies['token']) {
      const token = req.cookies['token'];
      return this.authService.loginWithCookies(token);
    } else {
      throw new BadRequestException(ERROR_AUTH.INVALID_AUTHENTICATION_CREDENTIALS);
    }
  }

  @HttpCode(200)
  @Delete('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('accessToken');
  }
}
