import { IsMongoId, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { ERROR_TEXTS } from '../constants/error-texts.enum';

export class ExpensesInputDto {
  @IsPositive({ message: ERROR_TEXTS.AMOUNT_SHOULD_BE_A_POSITIVE_NUMBER })
  amount: number;

  @IsOptional()
  @IsMongoId({ message: ERROR_TEXTS.EXPENSES_TYPE_ID_SHOULD_BE_A_VALID_MONGO_ID })
  expensesTypeId: string;

  @IsOptional()
  @IsMongoId({ message: ERROR_TEXTS.PAYMENT_SOURCE_ID_SHOULD_BE_A_VALID_MONGO_ID })
  paymentSourceId: string;

  @IsOptional()
  @IsString({ message: ERROR_TEXTS.COMMENTS_SHOULD_BE_A_STRING })
  @Length(0, 100, { message: ERROR_TEXTS.COMMENTS_SHOULD_BE_LESS_THAN_100_CHARACTERS })
  comments: string;
}
