import { Body, Controller, HttpCode, Post, Delete, Get, Query, Headers } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  async me() {
    return 'GET me';
  }

  @Post('register')
  async register(@Body() dto: AuthDto, @Headers('origin') origin: string) {
    return this.authService.register(dto, origin);
  }

  @Get('confirm')
  async confirm(@Query('token') token: string) {
    return this.authService.confirmRegistration(token);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() { email, password }: AuthDto) {}

  @HttpCode(200)
  @Post('logout')
  async logout() {}

  @Delete('delete')
  async delete(@Body() { email }: AuthDto) {}
}
