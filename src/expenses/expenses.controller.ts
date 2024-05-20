import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Req } from '@nestjs/common';
import { ExpensesInputDto } from './dto/expenses-input.dto';
import { FindExpenseDto } from './dto/find-expense.dto';
import { ExpensesService } from './expenses.service';
import { Request } from 'express';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}
  @Post('create')
  async create(@Body() dto: ExpensesInputDto, @Req() req: Request) {
    const token = req.cookies['accessToken'];
    return this.expensesService.create(dto, token);
  }

  // Get expenses by _id
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.expensesService.getById(id);
  }

  // Get all expenses by userId
  @Get('/user/:userId')
  async getByUserId(@Param('userId') userId: string, @Req() req: Request) {
    // ToDo: We need token verification middleware
    const token = req.cookies['accessToken'];
    return this.expensesService.findByUserId(userId, token);
  }

  // Get more expenses by other parameters
  @HttpCode(200)
  @Get('by-parameters')
  async find(@Body() dto: FindExpenseDto) {
    return this.expensesService.find(dto);
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
