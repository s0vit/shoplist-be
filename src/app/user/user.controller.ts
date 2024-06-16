import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { FindByEmailOutputDto } from './dto/find-by-email-output.dto';
import { GetUserByEmailSw } from './decorators/get-user-by-email-sw.decorator';
import { ApiTags } from '@nestjs/swagger';
import { CreateDataInputDto } from './dto/create-data-input.dto';
import { CustomRequest } from '../../common/interfaces/token.interface';
import { QuantityInputDto } from './dto/quantity-input.dto';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { CreateRandomCategorySwDec } from './decorators/create-random-category-sw.decorator';
import { CreateRandomExpensesSwDec } from './decorators/create-random-expenses-sw.decorator';
import { DeleteMeSwDec } from './decorators/delete-me-sw.decorator';
import { Request } from 'express';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @GetUserByEmailSw()
  @Get(':email')
  async get(@Param('email') email: string): Promise<FindByEmailOutputDto[]> {
    return this.userService.findByEmail(email);
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
}
