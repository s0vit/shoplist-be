import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { ExpensesInputDto } from './dto/expenses-input.dto';
import { FindExpenseDto } from './dto/find-expense.dto';

@Controller('expenses')
export class ExpensesController {
  @Post('create')
  async create(@Body() dto: ExpensesInputDto) {}

  @Get(':id')
  async get(@Param('id') id: string) {}

  @Delete(':id')
  async delete(@Param('id') id: string) {}

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: ExpensesInputDto) {}

  @HttpCode(200)
  @Post()
  async find(@Body() dto: FindExpenseDto) {}
}
