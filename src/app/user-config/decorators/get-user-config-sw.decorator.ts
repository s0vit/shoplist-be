import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserConfigOutputDto } from '../dto/user-config-output.dto';

export function GetUserConfigSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get user config',
      description: `
            Requires:
            - token in Headers`,
    }),
    ApiBearerAuth(),
    ApiOkResponse({
      description: 'User config successfully fetched',
      type: UserConfigOutputDto,
    }),
    ApiNotFoundResponse({
      description: 'User config not found',
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
    }),
  );
}
