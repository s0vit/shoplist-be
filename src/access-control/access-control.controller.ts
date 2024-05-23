import { Body, Controller, Delete, Param, Post, Req } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { AllowedUserDto } from './dto/allowed-user.dto';
import { Request } from 'express';

@Controller('access-control')
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}
  @Post()
  async create(@Body() dto: AllowedUserDto, @Req() req: Request) {
    const token = req.cookies['accessToken'];
    return this.accessControlService.create(dto, token);
  }

  @Delete(':id')
  async delete(@Param('id') accessId: string, @Req() req: Request) {
    const token = req.cookies['accessToken'];
    return this.accessControlService.delete(accessId, token);
  }
}
