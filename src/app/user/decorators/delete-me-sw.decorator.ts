import { USER_ERROR } from '../constants/user-error.enum';
import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function DeleteMeSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete Me',
      description: `
      Requires:
      - token in Headers`,
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: `
      - ok: The user was deleted successfully`,
    }),
    ApiResponse({
      status: 401,
      description: `
      - Conflict: ${USER_ERROR.TOKENS_MISMATCH}`,
    }),
    ApiResponse({
      status: 404,
      description: `
      - Conflict: ${USER_ERROR.DELETE_USER_ERROR}`,
    }),
    ApiResponse({
      status: 500,
      description: `
      - Internal Server Error: ${USER_ERROR.DELETE_USER_ERROR}`,
    }),
  );
}
