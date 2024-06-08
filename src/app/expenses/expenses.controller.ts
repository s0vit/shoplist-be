import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ExpensesInputDto } from './dto/expenses-input.dto';
import { ExpensesQueryInputDto } from './dto/expenses-query-input.dto';
import { ExpensesService } from './expenses.service';
import { SharedExpenseDto } from './dto/get-shared-input.dto';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import { GetExpensesSwDec } from './decorators/get-expenses-sw.decorator';
import { CreateExpensesSwDec } from './decorators/create-expenses-sw.decorator';
import { ExpensesOutputDto } from './dto/expenses-output.dto';
import { CustomRequest } from '../../common/interfaces/token.interface';
import { ValidMongoIdInParamsDec } from '../../common/decorators/valid-mongo-id.decorator';
import { GetByExpensesIdSwDec } from './decorators/get-by-expenses-id-sw.decorator';
import { GetSharedSwDec } from './decorators/get-shared-sw.decorator';
import { UpdateExpensesSwDec } from './decorators/update-expenses-sw.decorator';
import { DeleteExpensesSwDec } from './decorators/delete-expenses-sw.decorator';

@UseGuards(AccessJwtGuard)
@ApiTags('Expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @GetExpensesSwDec()
  @Get()
  async getOwn(@Query() queryInputDto: ExpensesQueryInputDto, @Req() req: CustomRequest): Promise<ExpensesOutputDto[]> {
    // ToDo: data from "Query" is not processed
    return this.expensesService.getOwn(req.user.userId);
  }

  @GetByExpensesIdSwDec()
  @Get(':expensesId')
  async getById(
    @ValidMongoIdInParamsDec({ param: 'expensesId' }) expensesId: string,
    @Req() req: CustomRequest,
  ): Promise<ExpensesOutputDto> {
    return this.expensesService.getById(expensesId, req.user.userId);
  }

  @GetSharedSwDec()
  @Get('shared/:sharedId')
  async getShared(@Param() { sharedId }: SharedExpenseDto, @Req() req: CustomRequest) {
    return this.expensesService.getSharedExpenses(sharedId, req.user.userId);
  }

  @CreateExpensesSwDec()
  @Post('create')
  async create(@Body() inputDto: ExpensesInputDto, @Req() req: CustomRequest): Promise<ExpensesOutputDto> {
    return this.expensesService.create(inputDto, req.user.userId);
  }

  @UpdateExpensesSwDec()
  @Put(':expensesId')
  async update(
    @ValidMongoIdInParamsDec({ param: 'expensesId' }) expensesId: string,
    @Body() inputDto: ExpensesInputDto,
    @Req() req: CustomRequest,
  ): Promise<ExpensesOutputDto> {
    return this.expensesService.update(expensesId, inputDto, req.user.userId);
  }

  @DeleteExpensesSwDec()
  @Delete(':expensesId')
  async delete(
    @ValidMongoIdInParamsDec({ param: 'expensesId' }) expensesId: string,
    @Req() req: CustomRequest,
  ): Promise<ExpensesOutputDto> {
    return this.expensesService.delete(expensesId, req.user.userId);
  }
}
