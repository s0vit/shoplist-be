import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { AccessControlOutputDto } from '../dto/access-control-output.dto';

export function GetAllAccessControlSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all access control',
      description: `
        Requires:
        - a token in the header`,
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Get all access control response',
      type: [AccessControlOutputDto],
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
