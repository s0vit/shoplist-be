import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from '../auth/models/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FindByEmailOutputDto } from './dto/find-by-email-output.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<FindByEmailOutputDto[]> {
    const emailRegex = new RegExp(email, 'i');
    const foundUsers = await this.userModel.find({ email: emailRegex });
    return foundUsers.map(
      (user) => new FindByEmailOutputDto(user._id, user.email, user.login, user.isVerified, user.loginDate),
    );
  }
}
