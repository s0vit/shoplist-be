import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ExpenseInputDto } from './dto/expense-input.dto';
import { ExpenseQueryInputDto } from './dto/expense-query-input.dto';
import { ExpenseService } from './expense.service';
import { SharedExpenseDto } from './dto/get-shared-input.dto';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import { GetExpenseSwDec } from './decorators/get-expense-sw.decorator';
import { CreateExpenseSwDec } from './decorators/create-expense-sw.decorator';
import { ExpenseOutputDto } from './dto/expense-output.dto';
import { CustomRequest } from '../../common/interfaces/token.interface';
import { ValidMongoIdInParamsDec } from '../../common/decorators/valid-mongo-id.decorator';
import { GetByExpenseIdSwDec } from './decorators/get-by-expense-id-sw.decorator';
import { GetSharedSwDec } from './decorators/get-shared-expense-sw.decorator';
import { UpdateExpenseSwDec } from './decorators/update-expense-sw.decorator';
import { DeleteExpenseSwDec } from './decorators/delete-expense-sw.decorator';

@UseGuards(AccessJwtGuard)
@ApiTags('Expenses')
@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expensesService: ExpenseService) {}

  @GetExpenseSwDec()
  @Get()
  async getOwn(@Query() queryInputDto: ExpenseQueryInputDto, @Req() req: CustomRequest): Promise<ExpenseOutputDto[]> {
    // ToDo: data from "Query" is not processed
    return this.expensesService.getOwn(req.user.userId);
  }

  @GetByExpenseIdSwDec()
  @Get(':expensesId')
  async getById(
    @ValidMongoIdInParamsDec({ param: 'expensesId' }) expensesId: string,
    @Req() req: CustomRequest,
  ): Promise<ExpenseOutputDto> {
    return this.expensesService.getById(expensesId, req.user.userId);
  }

  @GetSharedSwDec()
  @Get('shared/:sharedId')
  async getShared(@Param() { sharedId }: SharedExpenseDto, @Req() req: CustomRequest) {
    return this.expensesService.getSharedExpenses(sharedId, req.user.userId);
  }

  @CreateExpenseSwDec()
  @Post()
  async create(@Body() inputDto: ExpenseInputDto, @Req() req: CustomRequest): Promise<ExpenseOutputDto> {
    return this.expensesService.create(inputDto, req.user.userId);
  }

  @UpdateExpenseSwDec()
  @Put(':expensesId')
  async update(
    @ValidMongoIdInParamsDec({ param: 'expensesId' }) expensesId: string,
    @Body() inputDto: ExpenseInputDto,
    @Req() req: CustomRequest,
  ): Promise<ExpenseOutputDto> {
    return this.expensesService.update(expensesId, inputDto, req.user.userId);
  }

  @DeleteExpenseSwDec()
  @Delete(':expensesId')
  async delete(
    @ValidMongoIdInParamsDec({ param: 'expensesId' }) expensesId: string,
    @Req() req: CustomRequest,
  ): Promise<ExpenseOutputDto> {
    return this.expensesService.delete(expensesId, req.user.userId);
  }
}
