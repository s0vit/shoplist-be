import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function UploadAvatarSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Upload avatar',
      description: 'Requires a file',
    }),
    ApiBearerAuth(),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      required: true,
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
    ApiResponse({
      status: 200,
      description: 'Upload avatar response',
    }),
  );
}
