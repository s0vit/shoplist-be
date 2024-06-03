import { ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { AccessControlOutputDto } from '../dto/access-control-output.dto';

export function GetAllAccessControlSwDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get all access control',
      description: 'Requires a token in cookies',
    }),
    ApiCookieAuth(),
    ApiResponse({
      status: 200,
      description: 'Get all access control response',
      type: [AccessControlOutputDto],
    }),
  );
}
