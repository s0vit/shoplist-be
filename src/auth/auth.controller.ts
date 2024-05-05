import { Body, Controller, HttpCode, Post, Delete, Get, Req, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  @Get('me')
  async me(@Req() request: Request) {
    const token = request.cookies['token'];
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    return token;
  }

  @Post('register')
  async register(@Body() dto: AuthDto) {}

  @HttpCode(200)
  @Post('login')
  async login(@Body() { email, password }: AuthDto) {}

  @HttpCode(200)
  @Post('logout')
  async logout(@Body() { email }: AuthDto) {}

  @Delete('delete')
  async delete(@Body() { email }: AuthDto) {}
}
