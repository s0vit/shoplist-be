import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { USER_CONFIG_ERROR } from '../constants/user-config-error.enum';
import { UserConfigOutputDto } from '../dto/user-config-output.dto';

export function UpdateUserConfigSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update user config',
      description: `
            Requires:
            - token in Headers
            - id of the user config in Params
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
    ApiParam({
      name: 'id',
      description: 'User config id',
      type: String,
    }),
    ApiOkResponse({
      description: 'User config successfully updated',
      type: UserConfigOutputDto,
    }),
    ApiNotFoundResponse({
      description: USER_CONFIG_ERROR.USER_CONFIG_NOT_FOUND,
    }),
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
    }),
  );
}
