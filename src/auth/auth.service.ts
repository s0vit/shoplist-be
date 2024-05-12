import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './models/user.model';
import { AuthDto } from './dto/auth.dto';
import { genSalt, hash, compare } from 'bcryptjs';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ERROR_AUTH } from './constants/auth-constants.enum';
import { ConfirmResponseDto } from './dto/confirm-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret = this.configService.get<string>('ACCESS_TOKEN_KEY');
    this.refreshSecret = this.configService.get<string>('REFRESH_TOKEN_KEY');
  }

  private async generateTokens<T>(payload: T) {
    const accessSecret = this.accessSecret;
    const refreshSecret = this.refreshSecret;
    const accessToken = await this.jwtService.signAsync({ payload }, { secret: accessSecret, expiresIn: '2h' });
    const refreshToken = await this.jwtService.signAsync({ payload }, { secret: refreshSecret, expiresIn: '7d' });
    return { accessToken, refreshToken };
  }
  private async findUser(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }
  private async createUser(dto: AuthDto) {
    const salt = await genSalt(10);
    const newUser = new this.userModel({
      email: dto.email,
      login: dto.login ? dto.login : dto.email.split('@')[0],
      passwordHash: await hash(dto.password, salt),
    });
    await newUser.save();
  }

  async register(dto: AuthDto, origin: string) {
    const oldUser = await this.findUser(dto.email);
    if (oldUser) {
      throw new BadRequestException(ERROR_AUTH.USER_ALREADY_EXISTS);
    }
    try {
      const token = await this.jwtService.signAsync({ email: dto.email });
      const confirmationUrl = `${origin}/confirm?token=${token}`;
      await this.mailerService.sendMail({
        to: dto.email,
        subject: 'Confirm your registration',
        text: confirmationUrl,
      });
      await this.createUser(dto);
    } catch (error) {
      throw new HttpException(ERROR_AUTH.SEND_EMAIL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async confirmRegistration(token: string): Promise<ConfirmResponseDto> {
    // ToDo: Test on production
    try {
      const result = await this.jwtService.verifyAsync(token);
      const updatedUser = await this.userModel
        .findOneAndUpdate({ email: result.email }, { $set: { isVerified: true } }, { new: true })
        .exec();
      return new ConfirmResponseDto(updatedUser);
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(ERROR_AUTH.CONFIRM_REGISTRATION_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async login(email: string, password: string): Promise<LoginResponseDto> {
    // Here return data for payload accessToken cookie
    const findUser = await this.findUser(email);
    if (!findUser) {
      throw new BadRequestException(ERROR_AUTH.UNAUTHORIZED);
    }
    const validPassword = await compare(password, findUser.passwordHash);
    if (!validPassword) {
      throw new BadRequestException(ERROR_AUTH.UNAUTHORIZED);
    }
    const tokens = await this.generateTokens<{ email: string }>({ email });
    const updatedUser = await this.userModel.findOneAndUpdate({ email }, { $set: { ...tokens } }, { new: true }).exec();
    return new LoginResponseDto(updatedUser);
  }
  async loginWithCookies(token: string) {
    try {
      const result = this.jwtService.verify(token, { secret: this.accessSecret });
      return { email: result.email };
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      }
    }
  }
  async validateToken(token: string) {
    try {
      const result = await this.jwtService.verifyAsync(token, { secret: this.refreshSecret });
      const newTokens = await this.generateTokens<{ email: string }>({ email: result.payload.email });
      return await this.userModel
        .findOneAndUpdate({ email: result.payload.email }, { $set: { ...newTokens } }, { new: true })
        .exec();
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      }
    }
  }
  async logout(accessToken: string) {
    try {
      const decoded = this.jwtService.decode(accessToken);
      await this.userModel
        .findOneAndUpdate({ email: decoded.payload.email }, { $set: { accessToken: null, refreshToken: null } })
        .exec();
    } catch (error) {
      throw new HttpException(ERROR_AUTH.LOGOUT_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
