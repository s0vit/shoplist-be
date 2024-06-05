import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessControlService } from './access-control.service';
import { AccessControlInputDto } from './dto/access-control-input.dto';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { CustomRequest } from '../../common/interfaces/token.interface';
import { AccessControlOutputDto } from './dto/access-control-output.dto';
import { CreateAccessControlSwDec } from './decorators/create-access-control-sw.decorator';
import { UpdateAccessControlSwDec } from './decorators/update-access-control-sw.decorator';
import { DeleteAccessControlSwDec } from './decorators/delete-access-control-sw.decorator';
import { GetAllAccessControlSwDec } from './decorators/get-all-access-control-sw.decorator';

@UseGuards(AccessJwtGuard)
@ApiTags('Access control')
@Controller('access-control')
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @CreateAccessControlSwDec()
  @Post()
  async create(@Body() dto: AccessControlInputDto, @Req() req: CustomRequest): Promise<AccessControlOutputDto> {
    const { userId } = req.user;
    return this.accessControlService.create(userId, dto);
  }

  @DeleteAccessControlSwDec()
  @Delete(':id')
  async delete(@Param('id') accessId: string, @Req() req: CustomRequest): Promise<AccessControlOutputDto> {
    const { userId } = req.user;
    return this.accessControlService.delete(userId, accessId);
  }

  @UpdateAccessControlSwDec()
  @Put(':id')
  async update(
    @Param('id') accessId: string,
    @Body() dto: AccessControlInputDto,
    @Req() req: CustomRequest,
  ): Promise<AccessControlOutputDto> {
    const { userId } = req.user;
    return this.accessControlService.update(userId, accessId, dto);
  }

  @GetAllAccessControlSwDec()
  @Get()
  async get(@Req() req: CustomRequest): Promise<AccessControlOutputDto[]> {
    const { userId } = req.user;
    return this.accessControlService.getAll(userId);
  }
}
