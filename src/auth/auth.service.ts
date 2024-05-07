import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './models/user.model';
import { AuthDto } from './dto/auth.dto';
import { genSalt, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { ERROR_AUTH } from './constants/auth-constants.enum';

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
  async register(dto: AuthDto, host: string): Promise<void> {
    const oldUser = await this.findUser(dto.email);
    if (oldUser) {
      throw new BadRequestException(ERROR_AUTH.USER_ALREADY_EXISTS);
    }
    try {
      const token = await this.jwtService.signAsync({ email: dto.email });
      // ToDo: Бек должен отправлять ссылку а не токен, так ка по нему юзер должен перейти на свой фронт на верный роут,
      //  который возьмёт из ссылки токен и отправить на бэк.
      //  Так как у нас будут разные хосты(домены), придумал пока такой способ...
      const confirmationUrl = `${host}/confirm?token=${token}`;
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
  async confirmRegistration(token: string) {
    // ToDo: добавить try catch и убрать не нужные данные из return
    const result = this.jwtService.verify(token);
    const updatedUser = this.userModel
      .findOneAndUpdate(
        { email: result.email },
        { $set: { isVerified: true } },
        { new: true }, // возвращать обновленный документ
      )
      .exec();
    return updatedUser;
  }
  async findUser(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }
  async validateUser() {}
  async login() {}
}
