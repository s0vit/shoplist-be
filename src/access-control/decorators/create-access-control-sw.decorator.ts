import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { AccessControlInputDto } from '../dto/access-control-input.dto';
import { AccessControlOutputDto } from '../dto/access-control-output.dto';

export function CreateAccessControlSwDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create access control',
      description: 'Requires a token in cookies',
    }),
    ApiCookieAuth(),
    ApiBody({
      description: 'Create access control response',
      type: AccessControlInputDto,
    }),
    ApiResponse({
      status: 201,
      description: 'Create access control response',
      type: AccessControlOutputDto,
    }),
  );
}
