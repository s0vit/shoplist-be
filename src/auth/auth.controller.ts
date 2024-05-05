import { Body, Controller, HttpCode, Post, Delete, Get, BadRequestException } from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ERROR_AUTH } from './constants/auth-constants.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  async me() {
    return { message: 'auth me @GET' };
  }

  @Post('register')
  async register(@Body() dto: AuthDto) {
    const oldUser = await this.authService.findUser(dto.email);
    if (oldUser) {
      throw new BadRequestException(ERROR_AUTH.USER_ALREADY_EXISTS);
    }
    return this.authService.createUser(dto);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() { email, password }: AuthDto) {}

  @HttpCode(200)
  @Post('logout')
  async logout(@Body() { email }: AuthDto) {}

  @Delete('delete')
  async delete(@Body() { email }: AuthDto) {}
}
