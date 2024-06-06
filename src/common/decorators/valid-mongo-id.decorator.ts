import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

interface ValidMongoIdParams {
  param: string;
}

export const ValidMongoIdInParamsDec = createParamDecorator((data: ValidMongoIdParams, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const paramValue = request.params[data.param];
  if (!Types.ObjectId.isValid(paramValue)) {
    throw new BadRequestException('Invalid MongoDB object id');
  }
  return paramValue;
});
