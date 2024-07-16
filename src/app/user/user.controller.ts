import {
  Body,
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
import { CreateRandomCategorySwDec } from './decorators/create-random-category-sw.decorator';
import { CreateRandomExpensesSwDec } from './decorators/create-random-expenses-sw.decorator';
import { DeleteMeSwDec } from './decorators/delete-me-sw.decorator';
import { GetUserByEmailSwDec } from './decorators/get-user-by-email-sw.decorator';
import { GetUserByIdSwDeC } from './decorators/get-user-by-id-sw.decorator';
import { UploadAvatarSwDec } from './decorators/upload-avatar-sw.decorator';
import { CreateDataInputDto } from './dto/create-data-input.dto';
import { FindByOutputDto } from './dto/find-by-output.dto';
import { QuantityInputDto } from './dto/quantity-input.dto';
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
  @CreateRandomCategorySwDec()
  @Post('create-category-and-payment-source')
  async createCategoryAndPaymentSource(
    @Body() createDataInputDto: CreateDataInputDto,
    @Req() req: CustomRequest,
  ): Promise<void> {
    return this.userService.createCategoryAndPaymentSource(createDataInputDto, req.user.userId);
  }

  @UseGuards(AccessJwtGuard)
  @DeleteMeSwDec()
  @Delete('delete-me')
  async deleteMe(@Req() req: Request): Promise<string> {
    return this.userService.deleteMe(req.headers.authorization.split(' ')[1]);
  }

  @UseGuards(AccessJwtGuard)
  @CreateRandomExpensesSwDec()
  @Post('create-random-expenses')
  async createRandomExpenses(@Body() quantity: QuantityInputDto, @Req() req: CustomRequest) {
    return this.userService.createRandomExpenses(quantity, req.user.userId);
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
