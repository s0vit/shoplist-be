import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function DeleteAccessControlSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete access control',
      description: `
        Requires:
        - a token in the header`,
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'Access control id',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: 'Delete access control success',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}
