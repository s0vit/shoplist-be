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
import { GetExpenseByIdSwDec } from './decorators/get-expense-by-id-sw.decorator';
import { GetSharedSwDec } from './decorators/get-shared-expense-sw.decorator';
import { UpdateExpenseSwDec } from './decorators/update-expense-sw.decorator';
import { DeleteExpenseSwDec } from './decorators/delete-expense-sw.decorator';

@UseGuards(AccessJwtGuard)
@ApiTags('Expense')
@Controller('expense')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @GetExpenseSwDec()
  @Get()
  async getOwn(@Query() queryInputDto: ExpenseQueryInputDto, @Req() req: CustomRequest): Promise<ExpenseOutputDto[]> {
    return this.expenseService.getOwn(req.user.userId, queryInputDto);
  }

  @GetExpenseByIdSwDec()
  @Get(':expenseId')
  async getById(
    @ValidMongoIdInParamsDec({ param: 'expenseId' }) expenseId: string,
    @Req() req: CustomRequest,
  ): Promise<ExpenseOutputDto> {
    return this.expenseService.getById(expenseId, req.user.userId);
  }

  @GetSharedSwDec()
  @Get('shared/:sharedId')
  async getShared(@Param() { sharedId }: SharedExpenseDto, @Req() req: CustomRequest) {
    return this.expenseService.getSharedExpenses(sharedId, req.user.userId);
  }

  @CreateExpenseSwDec()
  @Post()
  async create(@Body() inputDto: ExpenseInputDto, @Req() req: CustomRequest): Promise<ExpenseOutputDto> {
    return this.expenseService.create(inputDto, req.user.userId);
  }

  @UpdateExpenseSwDec()
  @Put(':expenseId')
  async update(
    @ValidMongoIdInParamsDec({ param: 'expenseId' }) expenseId: string,
    @Body() inputDto: ExpenseInputDto,
    @Req() req: CustomRequest,
  ): Promise<ExpenseOutputDto> {
    return this.expenseService.update(expenseId, inputDto, req.user.userId);
  }

  @DeleteExpenseSwDec()
  @Delete(':expenseId')
  async delete(
    @ValidMongoIdInParamsDec({ param: 'expenseId' }) expenseId: string,
    @Req() req: CustomRequest,
  ): Promise<ExpenseOutputDto> {
    return this.expenseService.delete(expenseId, req.user.userId);
  }
}
