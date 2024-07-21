import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ACCESS_CONTROL_ERROR } from '../constants/access-control-error.enum';
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
    ApiOkResponse({
      description: 'Create access control success',
      type: AccessControlOutputDto,
    }),
    ApiUnauthorizedResponse({
      description: ACCESS_CONTROL_ERROR.FORBIDDEN,
    }),
    ApiForbiddenResponse({
      description: `
      error messages:
        - ${ACCESS_CONTROL_ERROR.CREATE_ACCESS_ERROR}
        - ${ACCESS_CONTROL_ERROR.OWN_ACCESS_ERROR}
        - ${ACCESS_CONTROL_ERROR.DUPLICATE_EXPENSES}
        - ${ACCESS_CONTROL_ERROR.DUPLICATE_CATEGORIES}
        - ${ACCESS_CONTROL_ERROR.DUPLICATE_PAYMENT_SOURCES}`,
    }),
    ApiInternalServerErrorResponse({
      description: ACCESS_CONTROL_ERROR.CREATE_ACCESS_ERROR,
    }),
  );
}
