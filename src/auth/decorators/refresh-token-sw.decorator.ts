import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RefreshInputDto } from '../dto/refresh-input.dto';

export function RefreshTokenSwDecorator() {
  return applyDecorators(
    ApiOperation({ summary: 'Refresh user token' }),
    ApiBody({ type: RefreshInputDto }),
    ApiResponse({ status: 200, description: 'The user token has been successfully refreshed.', type: RefreshInputDto }),
  );
}
