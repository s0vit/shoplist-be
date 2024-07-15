import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { USER_CONFIG_ERROR } from './constants/user-config-error.enum';
import { UserConfigInputDto } from './dto/user-config-input.dto';
import { UserConfigOutputDto } from './dto/user-config-output.dto';
import { UserConfig, UserConfigDocument } from './model/user-config.model';

@Injectable()
export class UserConfigService {
  constructor(@InjectModel(UserConfig.name) private readonly userConfigModel: Model<UserConfigDocument>) {}

  async createConfig(createConfigDto: UserConfigInputDto, userId: string): Promise<UserConfigOutputDto> {
    //check if user already has a config
    const userConfig = await this.userConfigModel.findOne({ userId });

    if (userConfig) {
      throw new ConflictException(USER_CONFIG_ERROR.USER_CONFIG_ALREADY_EXISTS);
    }

    const createdConfig = new this.userConfigModel({ ...createConfigDto, userId });
    const savedConfig = await createdConfig.save();

    return savedConfig.toObject({ versionKey: false });
  }

  async getConfig(userId: string): Promise<UserConfigOutputDto> {
    const userConfig = await this.userConfigModel.findOne({ userId });

    if (!userConfig) {
      throw new ConflictException(USER_CONFIG_ERROR.USER_CONFIG_NOT_FOUND);
    }

    return userConfig.toObject({ versionKey: false });
  }

  async updateConfig(updateConfigDto: UserConfigInputDto, userId: string, id: string): Promise<UserConfigOutputDto> {
    return this.userConfigModel.findOneAndUpdate({ userId, _id: id }, updateConfigDto, { new: true });
  }
}
