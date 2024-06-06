import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './models/user.model';
import { AuthInputDto } from './dto/auth-input.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ERROR_AUTH } from './constants/auth-error.enum';
import { ConfirmOutputDto } from './dto/confirm-output.dto';
import { LoginOutputDto } from './dto/login-output.dto';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from 'src/common/interfaces/token.interface';

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

  private async generateTokens(payload: object) {
    const accessSecret = this.accessSecret;
    const refreshSecret = this.refreshSecret;
    const accessToken = await this.jwtService.signAsync(payload, { secret: accessSecret, expiresIn: '2h' });
    const refreshToken = await this.jwtService.signAsync(payload, { secret: refreshSecret, expiresIn: '7d' });
    return { accessToken, refreshToken };
  }
  private async findUser(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }
  private async createUser(dto: AuthInputDto) {
    const salt = await genSalt(10);
    const passwordHash = await hash(dto.password, salt);
    const newUser = new this.userModel({
      email: dto.email,
      login: dto.email.split('@')[0],
      passwordHash,
    });
    await newUser.save();
  }

  async register(dto: AuthInputDto, origin: string) {
    const oldUser = await this.findUser(dto.email);
    if (oldUser) {
      throw new BadRequestException(ERROR_AUTH.USER_ALREADY_EXISTS);
    }
    try {
      const confirmToken = await this.jwtService.signAsync({ email: dto.email });
      const confirmationUrl = `${origin}/confirm?token=${confirmToken}`;
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
  async confirmRegistration(confirmToken: string): Promise<ConfirmOutputDto> {
    // ToDo: Test on production
    try {
      const result = await this.jwtService.verifyAsync<{ email: string }>(confirmToken);
      const updatedUser = await this.userModel
        .findOneAndUpdate({ email: result.email }, { $set: { isVerified: true } }, { new: true })
        .exec();
      return new ConfirmOutputDto(updatedUser);
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(ERROR_AUTH.CONFIRM_REGISTRATION_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async login(email: string, password: string): Promise<LoginOutputDto> {
    const foundUser = await this.findUser(email);
    if (!foundUser) {
      throw new BadRequestException(ERROR_AUTH.UNAUTHORIZED);
    }
    const validPassword = await compare(password, foundUser.passwordHash);
    if (!validPassword) {
      throw new BadRequestException(ERROR_AUTH.UNAUTHORIZED);
    }
    const payloadData = { email, userId: foundUser._id, isVerified: foundUser.isVerified };
    const tokens = await this.generateTokens(payloadData);
    const updatedUser = await this.userModel.findOneAndUpdate({ email }, { $set: { ...tokens } }, { new: true }).exec();
    return new LoginOutputDto(updatedUser);
  }
  async loginWithCookies(token: string) {
    try {
      const result = await this.jwtService.verifyAsync<TokenPayload>(token, { secret: this.accessSecret });
      const payloadData = { email: result.email, userId: result.userId, isVerified: result.isVerified };
      const tokens = await this.generateTokens(payloadData);
      const updatedUser = await this.userModel
        .findOneAndUpdate({ email: result.email }, { $set: { ...tokens } }, { new: true })
        .exec();
      return new LoginOutputDto(updatedUser);
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      }
    }
  }
  async validateToken(token: string) {
    try {
      const result = await this.jwtService.verifyAsync<TokenPayload>(token, { secret: this.refreshSecret });
      const payloadData = { email: result.email, userId: result.userId, isVerified: result.isVerified };
      const newTokens = await this.generateTokens(payloadData);
      const foundUser = await this.userModel
        .findOneAndUpdate({ email: result.email }, { $set: { ...newTokens } }, { new: true })
        .exec();
      if (!foundUser) {
        throw new Error();
      }
      return foundUser;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      } else {
        throw new NotFoundException();
      }
    }
  }
  async logout(accessToken: string) {
    try {
      const decoded = this.jwtService.decode<TokenPayload>(accessToken);
      await this.userModel
        .findOneAndUpdate({ email: decoded.email }, { $set: { accessToken: null, refreshToken: null } })
        .exec();
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(ERROR_AUTH.LOGOUT_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async requestConfirm(accessToken: string, origin: string) {
    if (!accessToken) {
      throw new BadRequestException(ERROR_AUTH.AUTH_ERROR_NO_TOKEN);
    }
    try {
      const decoded = this.jwtService.decode<TokenPayload>(accessToken);
      const confirmToken = await this.jwtService.signAsync({ email: decoded.email });
      const confirmationUrl = `${origin}/confirm?token=${confirmToken}`;
      await this.mailerService.sendMail({
        to: decoded.email,
        subject: 'Confirm your registration',
        text: confirmationUrl,
      });
    } catch (error) {
      throw new HttpException(ERROR_AUTH.SEND_EMAIL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async forgotPassword(email: string, origin: string) {
    try {
      const resetToken = await this.jwtService.signAsync({ email });
      const resetPasswordLink = `${origin}/reset-password?token=${resetToken}`;
      await this.userModel.findOneAndUpdate({ email }, { $set: { resetPasswordToken: resetToken } }).exec();
      await this.mailerService.sendMail({
        to: email,
        subject: 'Reset your password',
        text: resetPasswordLink,
      });
    } catch (error) {
      throw new HttpException(ERROR_AUTH.SEND_EMAIL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async resetPassword(newPassword: string, resetPasswordToken: string) {
    const decoded = this.jwtService.decode<{ email: string }>(resetPasswordToken);
    const salt = await genSalt(10);
    const passwordHash = await hash(newPassword, salt);
    const updatedUser = await this.userModel
      .findOneAndUpdate(
        { email: decoded.email, resetPasswordToken },
        { $set: { passwordHash, resetPasswordToken: null } },
      )
      .lean();
    if (!updatedUser) {
      throw new NotFoundException(ERROR_AUTH.NOT_FOUND_USER);
    }
  }
}
