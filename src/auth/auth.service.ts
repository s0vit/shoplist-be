import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './models/user.model';
import { AuthDto } from './dto/auth.dto';
import { genSalt, hash } from 'bcryptjs';
import { UserResponseDto } from './dto/user.response.dto';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}
  async createUser(dto: AuthDto): Promise<UserResponseDto> {
    const salt = await genSalt(10);
    const newUser = new this.userModel({
      email: dto.email,
      login: dto.login ? dto.login : dto.email.split('@')[0],
      passwordHash: await hash(dto.password, salt),
    });
    const savedUser = await newUser.save();
    return new UserResponseDto(savedUser);
  }
  async findUser(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }
  async validateUser() {}
  async login() {}
}
