import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { AccessControlInputDto } from './dto/access-control-input.dto';
import { ApiTags } from '@nestjs/swagger';
import { CustomRequest } from '../common/interfaces/token.interface';
import { AccessControlOutputDto } from './dto/access-control-output.dto';
import { CreateAccessControlSwDecorator } from './decorators/create-access-control-sw.decorator';
import { UpdateAccessControlSwDecorator } from './decorators/update-access-control-sw.decorator';
import { DeleteAccessControlSwDecorator } from './decorators/delete-access-control-sw.decorator';
import { GetAllAccessControlSwDecorator } from './decorators/get-all-access-control-sw.decorator';
import { AccessJwtGuard } from '../guards/access-jwt.guard';

@UseGuards(AccessJwtGuard)
@ApiTags('Access control')
@Controller('access-control')
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @CreateAccessControlSwDecorator()
  @Post()
  async create(@Body() dto: AccessControlInputDto, @Req() req: CustomRequest): Promise<AccessControlOutputDto> {
    const { userId } = req.user;
    return this.accessControlService.create(userId, dto);
  }

  @DeleteAccessControlSwDecorator()
  @Delete(':id')
  async delete(@Param('id') accessId: string, @Req() req: CustomRequest): Promise<AccessControlOutputDto> {
    const { userId } = req.user;
    return this.accessControlService.delete(userId, accessId);
  }

  @UpdateAccessControlSwDecorator()
  @Put(':id')
  async update(
    @Param('id') accessId: string,
    @Body() dto: AccessControlInputDto,
    @Req() req: CustomRequest,
  ): Promise<AccessControlOutputDto> {
    const { userId } = req.user;
    return this.accessControlService.update(userId, accessId, dto);
  }

  @GetAllAccessControlSwDecorator()
  @Get()
  async get(@Req() req: CustomRequest): Promise<AccessControlOutputDto[]> {
    const { userId } = req.user;
    return this.accessControlService.getAll(userId);
  }
}
