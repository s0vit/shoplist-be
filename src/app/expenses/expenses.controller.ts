import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ExpensesInputDto } from './dto/expenses-input.dto';
import { FindExpenseInputDto } from './dto/find-expense-input.dto';
import { ExpensesService } from './expenses.service';
import { SharedExpenseDto } from './dto/get-shared-input.dto';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import { GetExpensesSwDecorator } from './decorators/get-expenses-sw.decorator';
import { CreateExpensesSwDecorator } from './decorators/create-expenses-sw.decorator';
import { ExpensesOutputDto } from './dto/expenses-output.dto';
import { CustomRequest } from '../../common/interfaces/token.interface';
import { IsUserVerifiedGuard } from '../../guards/is-user-verified-guard';

@UseGuards(AccessJwtGuard, IsUserVerifiedGuard)
@ApiTags('Expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @CreateExpensesSwDecorator()
  @Post('create')
  async create(@Body() dto: ExpensesInputDto, @Req() req: CustomRequest): Promise<ExpensesOutputDto> {
    return this.expensesService.create(dto, req.user.userId);
  }

  // Get expenses by _id
  @Get('by-id/:id')
  async getById(@Param('id') id: string) {
    return this.expensesService.getById(id);
  }

  // Get own expenses
  @GetExpensesSwDecorator()
  @Get()
  async getOwn(@Query() dto: FindExpenseInputDto, @Req() req: CustomRequest) {
    // ToDo: data from "dto" is not processed
    return this.expensesService.getOwn(req.user.userId);
  }

  // Get shared expenses
  // we need a request/router "is anything for me at all?!"
  @Get('shared/:sharedId')
  async getShared(@Param() { sharedId }: SharedExpenseDto, @Req() req: CustomRequest) {
    return this.expensesService.getSharedExpenses(sharedId, req.user.userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.expensesService.delete(id);
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: ExpensesInputDto) {
    return this.expensesService.patch(id, dto);
  }
}
