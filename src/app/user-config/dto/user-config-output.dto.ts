import { ApiProperty } from '@nestjs/swagger';
import { CURRENCIES } from 'src/common/interfaces/currencies.enum';
import { LANGUAGES } from 'src/common/interfaces/languages.enum';
import { THEME_ENUM } from '../constants/theme.enum';

export class UserConfigOutputDto {
  @ApiProperty({
    type: String,
    description: 'Unique identifier of the user config',
  })
  _id: string;

  @ApiProperty({
    type: String,
    description: 'Preferred theme of the user',
    enum: THEME_ENUM,
  })
  theme: THEME_ENUM;

  @ApiProperty({
    type: String,
    description: 'Preferred currency of the user',
    enum: CURRENCIES,
  })
  currency: CURRENCIES;

  @ApiProperty({
    type: String,
    description: 'Preferred language of the user',
    enum: LANGUAGES,
  })
  language: LANGUAGES;

  @ApiProperty({
    type: Boolean,
    description: 'Show category colours',
  })
  showCategoryColours: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Show source colours',
  })
  showSourceColours: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Show category names',
  })
  showCategoryNames: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Show source names',
  })
  showSourceNames: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Show shared expenses',
  })
  showSharedExpenses: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Show shared categories',
  })
  showSharedCategories: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Show shared sources',
  })
  showSharedSources: boolean;
}
