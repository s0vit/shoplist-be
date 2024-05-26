import { IsMongoId } from 'class-validator';

export class SharedExpenseDto {
  @IsMongoId()
  sharedId: string;
}
