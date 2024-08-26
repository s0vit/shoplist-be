import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CustomRequest } from '../../common/interfaces/token.interface';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { DeleteMeSwDec } from './decorators/delete-me-sw.decorator';
import { GetUserByEmailSwDec } from './decorators/get-user-by-email-sw.decorator';
import { GetUserByIdSwDeC } from './decorators/get-user-by-id-sw.decorator';
import { UploadAvatarSwDec } from './decorators/upload-avatar-sw.decorator';
import { FindByOutputDto } from './dto/find-by-output.dto';
import { UserDocument } from './models/user.model';
import { UserService } from './user.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @GetUserByEmailSwDec()
  @Get(':email')
  async getByEmail(@Param('email') email: string): Promise<FindByOutputDto[]> {
    return this.userService.findByEmail(email);
  }

  @GetUserByIdSwDeC()
  @Get('id/:id')
  async getById(@Param('id') id: string): Promise<UserDocument> {
    return this.userService.findById(id);
  }

  @UseGuards(AccessJwtGuard)
  @DeleteMeSwDec()
  @Delete('delete-me')
  async deleteMe(@Req() req: Request): Promise<string> {
    return this.userService.deleteMe(req.headers.authorization.split(' ')[1]);
  }

  @UseGuards(AccessJwtGuard)
  @UploadAvatarSwDec()
  @HttpCode(200)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload-avatar')
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: CustomRequest): Promise<UserDocument> {
    return this.userService.uploadAvatar(req.user.userId, file);
  }
}
