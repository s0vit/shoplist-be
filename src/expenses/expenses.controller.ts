import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ExpensesInputDto } from './dto/expenses-input.dto';
import { FindExpenseDto } from './dto/find-expense.dto';
import { ExpensesService } from './expenses.service';
import { Request } from 'express';
import { SharedExpenseDto } from './dto/get-shared.dto';
import { CustomRequest } from '../common/interfaces/token.interface';
import { AccessJwtGuard } from '../auth/guards/access-jwt.guard';
import { ApiTags } from '@nestjs/swagger';
import { GetExpensesSwDec } from './decorators/get-expenses-sw-dec';
import { CreateExpensesSwDec } from './decorators/create-expenses-sw-dec';
import { ExpensesResponseDto } from './dto/expenses-response.dto';

@ApiTags('Expenses')
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @CreateExpensesSwDec()
  @Post('create')
  async create(@Body() dto: ExpensesInputDto, @Req() req: Request): Promise<ExpensesResponseDto> {
    const token = req.cookies['accessToken'];
    return this.expensesService.create(dto, token);
  }

  // Get expenses by _id
  @Get('by-id/:id')
  async getById(@Param('id') id: string) {
    return this.expensesService.getById(id);
  }

  // Get own expenses
  @GetExpensesSwDec()
  @Get()
  @UseGuards(AccessJwtGuard)
  async getOwn(@Query() dto: FindExpenseDto, @Req() req: CustomRequest) {
    // ToDo: data from "dto" is not processed
    return this.expensesService.getOwn(req.user.userId);
  }

  // Get shared expenses
  // we need a request/router "is anything for me at all?!"
  @Get('shared/:sharedId')
  @UsePipes(new ValidationPipe())
  @UseGuards(AccessJwtGuard)
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
