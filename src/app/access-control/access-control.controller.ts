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
import { DeleteMeFromSharedInputDto } from './dto/delete-me-from-shared-input.dto';
import { DeleteMeSwDec } from './decorators/delete-me-sw.decorator';
import { GetSharedWithMeAccessControlSwDec } from './decorators/get-shared-with-me-access-control-sw.decorator';

@UseGuards(AccessJwtGuard)
@ApiTags('Access control')
@Controller('access-control')
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @CreateAccessControlSwDec()
  @Post()
  async create(@Body() dto: AccessControlInputDto, @Req() req: CustomRequest): Promise<AccessControlOutputDto> {
    return this.accessControlService.create(req.user.userId, dto);
  }

  @GetAllAccessControlSwDec()
  @Get()
  async getOwn(@Req() req: CustomRequest): Promise<AccessControlOutputDto[]> {
    return this.accessControlService.getAll(req.user.userId);
  }

  @GetSharedWithMeAccessControlSwDec()
  @Get('me')
  async getSharedWithMe(@Req() req: CustomRequest): Promise<AccessControlOutputDto[]> {
    return this.accessControlService.getSharedWithMe(req.user.userId);
  }

  @DeleteMeSwDec()
  @Put('delete-me')
  async deleteMeFromShared(
    @Body() dto: DeleteMeFromSharedInputDto,
    @Req() req: CustomRequest,
  ): Promise<AccessControlOutputDto> {
    return this.accessControlService.deleteMeFromShared(req.user.userId, dto);
  }

  @DeleteAccessControlSwDec()
  @Delete(':id')
  async delete(@Param('id') accessId: string, @Req() req: CustomRequest): Promise<AccessControlOutputDto> {
    return this.accessControlService.delete(req.user.userId, accessId);
  }

  @UpdateAccessControlSwDec()
  @Put(':id')
  async update(
    @Param('id') accessId: string,
    @Body() dto: AccessControlInputDto,
    @Req() req: CustomRequest,
  ): Promise<AccessControlOutputDto> {
    return this.accessControlService.update(req.user.userId, accessId, dto);
  }
}
