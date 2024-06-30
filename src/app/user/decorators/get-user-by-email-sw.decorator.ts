import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { FindByOutputDto } from '../dto/find-by-output.dto';

export function GetUserByEmailSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user by email',
      description: 'Requires a partially user email',
    }),
    ApiParam({
      name: 'email',
      required: true,
      type: String,
      description: 'User email',
      example: 'exmaple@gmail.com',
    }),
    ApiResponse({
      status: 200,
      description: 'Get user by email response',
      type: [FindByOutputDto],
    }),
  );
}
