import { ArrayNotEmpty, IsArray, IsMongoId } from 'class-validator';

export class AllowedUserDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  allowedUsersId: string[];
}
