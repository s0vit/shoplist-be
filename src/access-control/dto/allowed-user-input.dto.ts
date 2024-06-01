import { ArrayNotEmpty, IsArray, IsMongoId } from 'class-validator';

export class AllowedUserInputDto {
  @IsMongoId()
  sharedWith: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  expenseIds: string[];
}
