import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { FindByEmailOutputDto } from '../dto/find-by-email-output.dto';

export function GetUserByEmailSw() {
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
      type: [FindByEmailOutputDto],
    }),
  );
}
