import { applyDecorators } from '@nestjs/common';
import { IsArray, IsMongoId, IsOptional } from 'class-validator';

export function IsOptionalMongoidArrayDec() {
  return applyDecorators(IsOptional(), IsArray(), IsMongoId({ each: true }));
}
