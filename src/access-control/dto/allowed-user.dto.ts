import { IsMongoId } from 'class-validator';

export class AllowedUserDto {
  @IsMongoId()
  allowedUserId: string;
}
