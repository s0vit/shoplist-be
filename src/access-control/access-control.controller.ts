import { Body, Controller, Delete, Param, Post, Req } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { AllowedUserInputDto } from './dto/allowed-user-input.dto';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Access control')
@Controller('access-control')
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}
  @Post()
  async create(@Body() dto: AllowedUserInputDto, @Req() req: Request) {
    const token = req.cookies['accessToken'];
    return this.accessControlService.create(dto, token);
  }

  @Delete(':id')
  async delete(@Param('id') accessId: string, @Req() req: Request) {
    const token = req.cookies['accessToken'];
    return this.accessControlService.delete(accessId, token);
  }
}
