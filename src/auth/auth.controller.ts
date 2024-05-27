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
import { RefreshDto } from './dto/refresh.dto';
import { COOKIE_SETTINGS } from './constants/auth-constants';
import { ERROR_AUTH } from './constants/auth-error.enum';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Register a new user',
    description: 'The user has been successfully created.Reminder: origin is required in the headers.',
  })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ status: 201, description: 'The user has been successfully created.' })
  @Post('register')
  async register(@Body() dto: AuthDto, @Headers('origin') origin: string) {
    return this.authService.register(dto, origin);
  }

  @ApiOperation({ summary: 'Confirm user registration' })
  @ApiParam({ name: 'token', required: true })
  @ApiResponse({ status: 200, description: 'The user registration has been successfully confirmed.' })
  @Get('confirm')
  async confirm(@Query('token') token: string) {
    return await this.authService.confirmRegistration(token);
  }

  @ApiOperation({
    summary: 'Login user',
    description: 'The user has been successfully logged in. Note: Requires a token in cookies.',
  })
  @ApiBody({ type: LoginDto })
  @ApiCookieAuth('accessToken')
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged in. Note: Requires a token in cookies.',
  })
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

  @ApiOperation({ summary: 'Refresh user token' })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({ status: 200, description: 'The user token has been successfully refreshed.' })
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.validateToken(dto.refreshToken);
    res.cookie('accessToken', result.accessToken, COOKIE_SETTINGS.ACCESS_TOKEN);
    return { refreshToken: result.refreshToken };
  }

  @ApiOperation({
    summary: 'Logout user',
    description: 'The user has been successfully logged out. Note: Requires a token in cookies.',
  })
  @ApiCookieAuth('accessToken')
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully logged out. Note: Requires a token in cookies.',
  })
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
