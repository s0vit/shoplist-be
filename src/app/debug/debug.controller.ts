import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Debug')
@Controller()
export class DebugController {
  @Get('/debug-sentry')
  getError() {
    throw new Error('My first Sentry error!');
  }
}