import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RefreshDto } from '../dto/refresh.dto';

export function RefreshTokenSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({ summary: 'Refresh user token' }),
    ApiBody({ type: RefreshDto }),
    ApiResponse({ status: 200, description: 'The user token has been successfully refreshed.' }),
  );
}
