import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TestEmailDto } from '../dto/test-email.dto';
import { ERROR_AUTH } from '../constants/auth-error.enum';

export function TestEmailSwDec() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Send a test email via Resend',
      description:
        'Allows a verified session to trigger a simple test email to any address, with optional custom text or HTML content.',
    }),
    ApiBody({ type: TestEmailDto }),
    ApiResponse({
      status: 201,
      description: 'Email successfully queued via Resend.',
    }),
    ApiResponse({
      status: 400,
      description: `Validation failed for request body (invalid email format).`,
    }),
    ApiResponse({
      status: 500,
      description: `Internal error while sending the test email: ${ERROR_AUTH.SEND_EMAIL_ERROR}`,
    }),
  );
}
