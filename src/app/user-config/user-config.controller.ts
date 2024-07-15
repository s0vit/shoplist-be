import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomRequest } from 'src/common/interfaces/token.interface';
import { AccessJwtGuard } from 'src/guards/access-jwt.guard';
import { CreateUserConfigSwDec } from './decorators/create-user-config-sw.decorator';
import { GetUserConfigSwDec } from './decorators/get-user-config-sw.decorator';
import { UpdateUserConfigSwDec } from './decorators/udate-user-config-sw.decorator';
import { UserConfigInputDto } from './dto/user-config-input.dto';
import { UserConfigOutputDto } from './dto/user-config-output.dto';
import { UserConfigService } from './user-config.service';

@UseGuards(AccessJwtGuard)
@ApiTags('User Config')
@Controller('user-config')
export class UserConfigController {
  constructor(private readonly userConfigService: UserConfigService) {}

  @CreateUserConfigSwDec()
  @Post()
  async createConfig(
    @Body() createConfigDto: UserConfigInputDto,
    @Req() req: CustomRequest,
  ): Promise<UserConfigOutputDto> {
    return this.userConfigService.createConfig(createConfigDto, req.user.userId);
  }

  @GetUserConfigSwDec()
  @Get()
  async getConfig(@Req() req: CustomRequest): Promise<UserConfigOutputDto> {
    return this.userConfigService.getConfig(req.user.userId);
  }

  @UpdateUserConfigSwDec()
  @Put(':id')
  async updateConfig(
    @Body() updateConfigDto: UserConfigInputDto,
    @Req() req: CustomRequest,
    @Param('id') id: string,
  ): Promise<UserConfigOutputDto> {
    return this.userConfigService.updateConfig(updateConfigDto, req.user.userId, id);
  }
}
