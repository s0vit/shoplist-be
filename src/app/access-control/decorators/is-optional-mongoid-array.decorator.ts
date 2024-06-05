import { applyDecorators } from '@nestjs/common';
import { ArrayNotEmpty, IsArray, IsMongoId, IsOptional } from 'class-validator';

export function IsOptionalMongoidArrayDec() {
  return applyDecorators(IsOptional(), IsArray(), ArrayNotEmpty(), IsMongoId({ each: true }));
}
