import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export function ManualBackupSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Manually trigger a database backup',
      description: `
        Requires:
        - token in the header

        This endpoint allows administrators to manually trigger a database backup.
        The backup process runs asynchronously in the background.
      `,
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'Database backup process has been initiated.',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Database backup process has been initiated.',
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized: User is not authenticated or does not have sufficient permissions.',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error: Failed to initiate database backup.',
    }),
  );
}
