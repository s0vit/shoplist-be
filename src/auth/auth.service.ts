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

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}
  async createUser(dto: AuthDto) {
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
      const token = await this.jwtService.signAsync({ email: dto.email }, { expiresIn: '15m' });
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
    //ToDo: Протестить на проде
    try {
      const result = this.jwtService.verify(token);
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
  async findUser(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }
  async login(email: string, password: string): Promise<LoginResponseDto> {
    const findUser = await this.findUser(email);
    if (!findUser) {
      throw new BadRequestException(ERROR_AUTH.UNAUTHORIZED);
    }
    const validPassword = await compare(password, findUser.passwordHash);
    if (!validPassword) {
      throw new BadRequestException(ERROR_AUTH.UNAUTHORIZED);
    }
    const accessToken = await this.jwtService.signAsync({ email }, { expiresIn: '2h' });
    const refreshToken = await this.jwtService.signAsync({ email }, { expiresIn: '7d' });
    const updatedUser = await this.userModel
      .findOneAndUpdate({ email }, { $set: { refreshToken, accessToken } }, { new: true })
      .exec();
    return new LoginResponseDto(updatedUser);
  }
  async loginWithCookies(token: string) {
    // ToDo: Реализовать проверку токена с БД
    try {
      const result = this.jwtService.verify(token);
      return { result };
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        const jwtError = error as JsonWebTokenError;
        throw new HttpException(jwtError.message, HttpStatus.BAD_REQUEST);
      }
    }
  }
}
