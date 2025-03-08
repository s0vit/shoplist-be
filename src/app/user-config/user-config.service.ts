import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { USER_CONFIG_ERROR } from './constants/user-config-error.enum';
import { UserConfigInputDto } from './dto/user-config-input.dto';
import { UserConfigOutputDto } from './dto/user-config-output.dto';
import { UserConfig, UserConfigDocument } from './model/user-config.model';
import { THEME_ENUM } from './constants/theme.enum';
import { CURRENCIES } from '../../common/interfaces/currencies.enum';
import { LANGUAGES } from '../../common/interfaces/languages.enum';

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
    const result = savedConfig.toObject({ versionKey: false });

    return {
      _id: result._id.toString(),
      theme: result.theme as THEME_ENUM,
      currency: result.currency as CURRENCIES,
      language: result.language as LANGUAGES,
      showCategoryColours: result.showCategoryColours,
      showSourceColours: result.showSourceColours,
      showCategoryNames: result.showCategoryNames,
      showSourceNames: result.showSourceNames,
      showSharedExpenses: result.showSharedExpenses,
      showSharedCategories: result.showSharedCategories,
      showSharedSources: result.showSharedSources,
      showExpensesInEachCurrency: result.showExpensesInEachCurrency,
    };
  }

  async getConfig(userId: string): Promise<UserConfigOutputDto> {
    const userConfig = await this.userConfigModel.findOne({ userId }).select('-userId');

    if (!userConfig) {
      throw new ConflictException(USER_CONFIG_ERROR.USER_CONFIG_NOT_FOUND);
    }

    const result = userConfig.toObject({
      versionKey: false,
      transform: (_doc, ret) => {
        delete ret.userId;
        return ret;
      },
    });

    return {
      _id: result._id.toString(),
      theme: result.theme as THEME_ENUM,
      currency: result.currency as CURRENCIES,
      language: result.language as LANGUAGES,
      showCategoryColours: result.showCategoryColours,
      showSourceColours: result.showSourceColours,
      showCategoryNames: result.showCategoryNames,
      showSourceNames: result.showSourceNames,
      showSharedExpenses: result.showSharedExpenses,
      showSharedCategories: result.showSharedCategories,
      showSharedSources: result.showSharedSources,
      showExpensesInEachCurrency: result.showExpensesInEachCurrency,
    };
  }

  async updateConfig(updateConfigDto: UserConfigInputDto, userId: string, id: string): Promise<UserConfigOutputDto> {
    const updated = await this.userConfigModel
      .findOneAndUpdate({ userId, _id: id }, updateConfigDto, { new: true })
      .select('-userId -__v');

    if (!updated) {
      throw new ConflictException(USER_CONFIG_ERROR.USER_CONFIG_NOT_FOUND);
    }

    const result = updated.toObject();
    return {
      _id: result._id.toString(),
      theme: result.theme as THEME_ENUM,
      currency: result.currency as CURRENCIES,
      language: result.language as LANGUAGES,
      showCategoryColours: result.showCategoryColours,
      showSourceColours: result.showSourceColours,
      showCategoryNames: result.showCategoryNames,
      showSourceNames: result.showSourceNames,
      showSharedExpenses: result.showSharedExpenses,
      showSharedCategories: result.showSharedCategories,
      showSharedSources: result.showSharedSources,
      showExpensesInEachCurrency: result.showExpensesInEachCurrency,
    };
  }
}
