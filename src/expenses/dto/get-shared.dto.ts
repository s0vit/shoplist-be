import { IsMongoId } from 'class-validator';

export class SharedDto {
  @IsMongoId()
  sharedId: string;
}
