import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { CURRENCIES } from 'src/common/interfaces/currencies.enum';
import { LANGUAGES } from 'src/common/interfaces/languages.enum';
import { THEME_ENUM } from '../constants/theme.enum';

export class UserConfigInputDto {
  @ApiProperty({
    type: String,
    description: 'Preferred theme of the user',
    enum: THEME_ENUM,
  })
  @IsEnum(THEME_ENUM)
  theme: THEME_ENUM;

  @ApiProperty({
    type: String,
    description: 'Preferred currency of the user',
    enum: CURRENCIES,
  })
  @IsEnum(CURRENCIES)
  currency: CURRENCIES;

  @ApiProperty({
    type: String,
    description: 'Preferred language of the user',
    enum: LANGUAGES,
  })
  @IsEnum(LANGUAGES)
  language: LANGUAGES;

  @ApiProperty({
    type: Boolean,
    description: 'Show category colours',
  })
  @IsBoolean()
  showCategoryColours: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Show source colours',
  })
  @IsBoolean()
  showSourceColours: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Show category names',
  })
  @IsBoolean()
  showCategoryNames: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Show source names',
  })
  @IsBoolean()
  showSourceNames: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Show shared expenses',
  })
  @IsBoolean()
  showSharedExpenses: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Show shared categories',
  })
  @IsBoolean()
  showSharedCategories: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Show shared sources',
  })
  @IsBoolean()
  showSharedSources: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Show expenses in each currency',
  })
  @IsOptional()
  @IsBoolean()
  showExpensesInEachCurrency?: boolean;
}
