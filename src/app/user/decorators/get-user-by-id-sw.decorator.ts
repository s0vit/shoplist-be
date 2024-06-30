import { FindByOutputDto } from '../dto/find-by-output.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function GetUserByIdSwDeC() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user by id',
      description: `
        Requires:
        - a token in the header`,
    }),
    ApiParam({
      name: 'id',
      required: true,
      type: String,
      description: 'User id',
      example: '5f6a0c8b3e0b8f001f8e7e7c',
    }),
    ApiResponse({
      status: 200,
      description: 'Get user by id response',
      type: [FindByOutputDto],
    }),
  );
}
