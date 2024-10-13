import { MailerService } from '@nestjs-modules/mailer';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, genSalt, hash } from 'bcryptjs';
import { Model } from 'mongoose';
import { GoogleResponse, TokenPayload } from 'src/common/interfaces/token.interface';
import { confirmEmailTemplate } from '../../utils/templates/confirm-email.template';
import { CategoryService } from '../category/category.service';
import { PaymentSourceService } from '../payment-source/payment-source.service';
import { User, UserDocument } from '../user/models/user.model';
import { ERROR_AUTH } from './constants/auth-error.enum';
import { AuthInputDto } from './dto/auth-input.dto';
import { ConfirmOutputDto } from './dto/confirm-output.dto';
import { LoginOutputDto } from './dto/login-output.dto';
import { UtilsService } from '../../common/utils/utils.service';

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
    private readonly categoryService: CategoryService,
    private readonly paymentSourceService: PaymentSourceService,
    private readonly utilsService: UtilsService,
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
    const emailRegex = this.utilsService.createCaseInsensitiveRegexFromString(email);

    return this.userModel.findOne({ email: { $regex: emailRegex } }).exec();
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

    return newUser;
  }

  async register(dto: AuthInputDto, origin: string): Promise<string> {
    const foundUser = await this.findUser(dto.email);

    if (foundUser) {
      throw new BadRequestException(ERROR_AUTH.USER_ALREADY_EXISTS);
    }

    try {
      const newUser = await this.createUser(dto);
      await this.categoryService.createDefaultCategories(newUser._id);
      await this.paymentSourceService.createDefaultPaymentSources(newUser._id);
    } catch (error) {
      throw new HttpException(ERROR_AUTH.CREATE_USER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    try {
      const confirmToken = await this.jwtService.signAsync({ email: dto.email });
      const confirmationUrl = `${origin}/confirm?token=${confirmToken}`;
      await this.mailerService.sendMail({
        to: dto.email,
        subject: 'Confirm your registration',
        html: confirmEmailTemplate(confirmToken, confirmationUrl),
      });

      return confirmToken;
    } catch (error) {
      throw new HttpException(ERROR_AUTH.SEND_EMAIL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async confirmRegistration(confirmToken: string): Promise<ConfirmOutputDto> {
    try {
      const verifiedToken = await this.jwtService.verifyAsync<{ email: string }>(confirmToken);
      const foundUser = await this.findUser(verifiedToken.email);

      if (!foundUser || verifiedToken.email !== foundUser.email) {
        throw new ConflictException(ERROR_AUTH.CONFIRM_REGISTRATION_CONFLICT);
      }

      const emailRegex = this.utilsService.createCaseInsensitiveRegexFromString(verifiedToken.email);
      const updatedUser = await this.userModel
        .findOneAndUpdate(
          { email: { $regex: emailRegex } },
          { $set: { isVerified: true, lastVerificationRequest: null } },
          { new: true },
        )
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
    const emailRegex = this.utilsService.createCaseInsensitiveRegexFromString(email);
    const updatedUser = await this.userModel
      .findOneAndUpdate({ email: { $regex: emailRegex } }, { $set: { ...tokens } }, { new: true })
      .exec();

    return new LoginOutputDto(updatedUser);
  }

  async validateToken(token: string): Promise<LoginOutputDto> {
    try {
      const result = await this.jwtService.verifyAsync<TokenPayload>(token, { secret: this.refreshSecret });
      const payloadData = { email: result.email, userId: result.userId, isVerified: result.isVerified };
      const newTokens = await this.generateTokens(payloadData);
      const emailRegex = this.utilsService.createCaseInsensitiveRegexFromString(result.email);
      const foundUser = await this.userModel
        .findOneAndUpdate({ email: { $regex: emailRegex } }, { $set: { ...newTokens } }, { new: true })
        .exec();

      if (!foundUser) {
        throw new Error();
      }

      return new LoginOutputDto(foundUser);
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
      const emailRegex = this.utilsService.createCaseInsensitiveRegexFromString(decoded.email);
      await this.userModel
        .findOneAndUpdate({ email: { $regex: emailRegex } }, { $set: { accessToken: null, refreshToken: null } })
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
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const emailRegex = this.utilsService.createCaseInsensitiveRegexFromString(decoded.email);
      const user = await this.userModel
        .findOneAndUpdate(
          // lastVerificationRequest update only if the previous request was more than an hour ago
          {
            email: { $regex: emailRegex },
            $or: [{ lastVerificationRequest: { $eq: null } }, { lastVerificationRequest: { $lt: oneHourAgo } }],
          },
          { $set: { lastVerificationRequest: now } },
          { new: true, runValidators: true },
        )
        .exec();

      if (!user) {
        throw new HttpException(ERROR_AUTH.TOO_MANY_REQUESTS, HttpStatus.TOO_MANY_REQUESTS);
      }

      const confirmToken = await this.jwtService.signAsync({ email: user.email });
      const resetLink = `${origin}/confirm?token=${confirmToken}`;
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Confirm your registration',
        html: confirmEmailTemplate(confirmToken, resetLink),
      });
    } catch (error) {
      throw new HttpException(ERROR_AUTH.SEND_EMAIL_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async forgotPassword(email: string, origin: string) {
    try {
      const resetToken = await this.jwtService.signAsync({ email });
      const resetPasswordLink = `${origin}/reset-password?token=${resetToken}`;
      const emailRegex = this.utilsService.createCaseInsensitiveRegexFromString(email);
      await this.userModel
        .findOneAndUpdate({ email: { $regex: emailRegex } }, { $set: { resetPasswordToken: resetToken } })
        .exec();
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
    const emailRegex = this.utilsService.createCaseInsensitiveRegexFromString(decoded.email);
    const updatedUser = await this.userModel
      .findOneAndUpdate(
        { email: { $regex: emailRegex }, resetPasswordToken },
        { $set: { passwordHash, resetPasswordToken: null } },
      )
      .lean();

    if (!updatedUser) {
      throw new NotFoundException(ERROR_AUTH.NOT_FOUND_USER);
    }
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const foundUser = await this.userModel.findById(userId).exec();
    const validPassword = await compare(oldPassword, foundUser.passwordHash);

    if (!validPassword) {
      throw new BadRequestException(ERROR_AUTH.WRONG_PASSWORD);
    }

    const isSamePassword = await compare(newPassword, foundUser.passwordHash);

    if (isSamePassword) {
      throw new BadRequestException(ERROR_AUTH.SAME_PASSWORD);
    }

    const salt = await genSalt(10);
    const passwordHash = await hash(newPassword, salt);

    await this.userModel.findByIdAndUpdate(userId, { $set: { passwordHash } }).exec();
  }

  async validateOAuthLogin(profile: GoogleResponse): Promise<{ accessToken: string; refreshToken: string }> {
    const { id, emails, displayName } = profile;

    let user = await this.userModel.findOne({ googleId: id });

    // also check user by email

    const sameEmailUser = await this.userModel.findOne({ email: emails[0].value });

    // if sameEmail user exists, then update googleId field and return token
    if (sameEmailUser) {
      const emailRegex = this.utilsService.createCaseInsensitiveRegexFromString(emails[0].value);
      await this.userModel.findOneAndUpdate({ email: { $regex: emailRegex } }, { googleId: id });
      const payload = { email: sameEmailUser.email, sub: sameEmailUser._id };

      const tokens = await this.generateTokens(payload);
      await this.userModel.findOneAndUpdate({ email: { $regex: emailRegex } }, { ...tokens });

      return tokens;
    }

    if (!user) {
      user = new this.userModel({
        email: emails[0].value,
        login: displayName,
        googleId: id,
        isVerified: true,
      });
      await user.save();

      await this.categoryService.createDefaultCategories(user._id);
      await this.paymentSourceService.createDefaultPaymentSources(user._id);
    }

    const payload = { email: user.email, sub: user._id };

    const tokens = await this.generateTokens(payload);
    const emailRegex = this.utilsService.createCaseInsensitiveRegexFromString(user.email);
    await this.userModel.findOneAndUpdate({ email: { $regex: emailRegex } }, { ...tokens });

    return tokens;
  }
}
