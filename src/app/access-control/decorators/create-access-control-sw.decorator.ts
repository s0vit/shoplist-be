import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccessControlInputDto } from '../dto/access-control-input.dto';
import { AccessControlOutputDto } from '../dto/access-control-output.dto';

export function CreateAccessControlSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create access control',
      description: `
        Requires:
        - a token in the header`,
    }),
    ApiBearerAuth(),
    ApiBody({
      description: 'DTO with access control data',
      type: AccessControlInputDto,
    }),
    ApiResponse({
      status: 201,
      description: 'Create access control success',
      type: AccessControlOutputDto,
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
