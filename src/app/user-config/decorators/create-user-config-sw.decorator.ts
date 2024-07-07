import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { USER_CONFIG_ERROR } from '../constants/user-config-error.enum';
import { UserConfigOutputDto } from '../dto/user-config-output.dto';

export function CreateUserConfigSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Create user config',
      description: `
        Requires:
        - token in Headers
        - theme in Body
        - currency in Body
        - language in Body
        - showCategoryColours in Body
        - showSourceColours in Body
        - showCategoryNames in Body
        - showSourceNames in Body
        - showSharedExpenses in Body`,
    }),
    ApiBearerAuth(),
    ApiCreatedResponse({
      description: 'The user config was created successfully',
      type: UserConfigOutputDto,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
    ApiConflictResponse({
      description: USER_CONFIG_ERROR.USER_CONFIG_ALREADY_EXISTS,
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
    }),
  );
}
