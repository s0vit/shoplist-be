import { IsMongoId, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { EXPENSES_ERROR } from '../constants/expenses-error.enum';

export class ExpensesInputDto {
  @IsPositive({ message: EXPENSES_ERROR.AMOUNT_SHOULD_BE_A_POSITIVE_NUMBER })
  amount: number;

  @IsOptional()
  @IsMongoId({ message: EXPENSES_ERROR.EXPENSES_TYPE_ID_SHOULD_BE_A_VALID_MONGO_ID })
  expensesTypeId: string;

  @IsOptional()
  @IsMongoId({ message: EXPENSES_ERROR.PAYMENT_SOURCE_ID_SHOULD_BE_A_VALID_MONGO_ID })
  paymentSourceId: string;

  @IsOptional()
  @IsString({ message: EXPENSES_ERROR.COMMENTS_SHOULD_BE_A_STRING })
  @Length(0, 100, { message: EXPENSES_ERROR.COMMENTS_SHOULD_BE_LESS_THAN_100_CHARACTERS })
  comments: string;
}
