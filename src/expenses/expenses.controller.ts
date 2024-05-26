import { Body, Controller, Delete, Get, Param, Patch, Post, Req, ValidationPipe, UsePipes } from '@nestjs/common';
import { ExpensesInputDto } from './dto/expenses-input.dto';
import { FindExpenseDto } from './dto/find-expense.dto';
import { ExpensesService } from './expenses.service';
import { Request } from 'express';
import { SharedDto } from './dto/get-shared.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}
  @Post('create')
  async create(@Body() dto: ExpensesInputDto, @Req() req: Request) {
    const token = req.cookies['accessToken'];
    return this.expensesService.create(dto, token);
  }

  // Get expenses by _id
  @Get('by-id/:id')
  async getById(@Param('id') id: string) {
    return this.expensesService.getById(id);
  }

  // Get own expenses
  @Get('own')
  async getOwn(@Req() req: Request) {
    const token = req.cookies['accessToken'];
    return this.expensesService.getOwn(token);
  }

  // Get shared expenses
  // we need a request/router "is anything for me at all?!"
  @Get('shared/:sharedId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getShared(@Param() { sharedId }: SharedDto, @Req() req: Request) {
    const token = req.cookies['accessToken'];
    return this.expensesService.getSharedExpenses(sharedId, token);
  }

  // Get more expenses by other parameters
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
