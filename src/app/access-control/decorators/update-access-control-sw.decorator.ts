import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { AccessControlInputDto } from '../dto/access-control-input.dto';
import { AccessControlOutputDto } from '../dto/access-control-output.dto';

export function UpdateAccessControlSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update access control',
      description: 'Requires a token in the header and id',
    }),
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'Access control id',
      type: String,
    }),
    ApiBody({
      description: 'Update access control body',
      type: AccessControlInputDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Update access control response',
      type: AccessControlOutputDto,
    }),
  );
}
