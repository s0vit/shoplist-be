import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ERROR_AUTH } from '../constants/auth-error.enum';
import { SetNewPasswordDto } from '../dto/set-new-password.dto';

export function SetNewPasswordSwDec() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Set new password',
      description: `
        Requires:
        - token in header
        - old password in Body
        - new password in Body
        `,
    }),
    ApiBody({ type: SetNewPasswordDto }),
    ApiOkResponse({
      description: 'The password has been successfully updated',
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
    ApiBadRequestResponse({
      description: 'Logical and validation errors',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: [
                  ERROR_AUTH.WRONG_PASSWORD,
                  ERROR_AUTH.PASSWORD_ERROR,
                  ERROR_AUTH.SAME_PASSWORD,
                  'Password must be shorter than or equal to 20 characters',
                  'Password must be longer than or equal to 6 characters',
                  'Password must be a string',
                  'Password must contain at least one digit and one uppercase letter',
                ],
              },
            },
          },
        },
      },
    }),
  );
}
