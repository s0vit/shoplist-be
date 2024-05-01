import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ExpensesInputDto } from './dto/expenses-input.dto';
import { FindExpenseDto } from './dto/find-expense.dto';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}
  @Post('create')
  async create(@Body() dto: ExpensesInputDto) {
    return this.expensesService.create(dto);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.expensesService.get(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.expensesService.delete(id);
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: ExpensesInputDto) {
    return this.expensesService.patch(id, dto);
  }

  @HttpCode(200)
  @Get()
  async find(@Body() dto: FindExpenseDto) {
    return this.expensesService.find(dto);
  }
}
