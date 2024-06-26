import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';
import { DeleteMeFromSharedInputDto } from '../dto/delete-me-from-shared-input.dto';
import { ACCESS_CONTROL_ERROR } from '../constants/access-control-error.enum';

export function DeleteMeSwDec() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete me from shared',
      description: `
        Requires: 
          - accessId in body,
          - token in header,
          
        Optionally in body:
          - expenseIds?: string[],
          - categoryIds?: string[],
          - paymentSourceIds?: string[]
      `,
    }),
    ApiBearerAuth(),
    ApiBody({
      description: `DTO with IDs of shared expenses, categories, and payment sources.`,
      type: DeleteMeFromSharedInputDto,
    }),
    ApiResponse({
      status: 200,
      description: 'Delete me from shared response',
      type: DeleteMeFromSharedInputDto,
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 404,
      description: `${ACCESS_CONTROL_ERROR.NOT_FOUND}`,
    }),
    ApiResponse({
      status: 403,
      description: `${ACCESS_CONTROL_ERROR.DELETE_ME_ERROR}`,
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
    }),
  );
}
