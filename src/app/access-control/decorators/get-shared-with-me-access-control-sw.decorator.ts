import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { AccessControlOutputDto } from '../dto/access-control-output.dto';

export function GetSharedWithMeAccessControlSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get shared with me access control',
      description: `
        Requires:
        - a token in the header`,
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Get shared with me access control response',
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
