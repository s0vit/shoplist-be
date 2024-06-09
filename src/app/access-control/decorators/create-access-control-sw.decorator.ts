import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccessControlInputDto } from '../dto/access-control-input.dto';
import { AccessControlOutputDto } from '../dto/access-control-output.dto';

export function CreateAccessControlSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create access control',
      description: 'Requires a token in the header',
    }),
    ApiBearerAuth(),
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
