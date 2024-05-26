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
} from '@nestjs/common';
import { ExpensesInputDto } from './dto/expenses-input.dto';
import { FindExpenseDto } from './dto/find-expense.dto';
import { ExpensesService } from './expenses.service';
import { Request } from 'express';
import { SharedExpenseDto } from './dto/get-shared.dto';
import { AccessJwtGuard } from './guards/access-jwt-guard.service';
import { CustomRequest } from '../common/interfaces/token.interface';

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
  @Get()
  @UseGuards(AccessJwtGuard)
  async getOwn(@Body() dto: FindExpenseDto, @Req() req: CustomRequest) {
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
