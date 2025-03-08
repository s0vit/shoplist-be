import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { PostponedExpenseService } from './postponed-expense.service';
import { PostponedExpenseInputDto } from './dto/postponed-expense-input.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { CreatePostponedExpenseSwagger } from './decorators/create-postponed-expense.decorator';
import { GetAllPostponedExpensesSwagger } from './decorators/get-all-postponed-expenses.decorator';
import { GetOnePostponedExpenseSwagger } from './decorators/get-one-postponed-expense.decorator';
import { UpdatePostponedExpenseSwagger } from './decorators/update-postponed-expense.decorator';
import { DeletePostponedExpenseSwagger } from './decorators/delete-postponed-expense.decorator';

@ApiTags('Postponed Expenses')
@Controller('postponed-expenses')
@UseGuards(AccessJwtGuard)
@ApiBearerAuth()
export class PostponedExpenseController {
  constructor(private readonly postponedExpenseService: PostponedExpenseService) {}

  @Post()
  @CreatePostponedExpenseSwagger()
  create(@Body() createDto: PostponedExpenseInputDto, @Request() req) {
    return this.postponedExpenseService.create(createDto, req.user.userId);
  }

  @Get()
  @GetAllPostponedExpensesSwagger()
  findAll(@Request() req) {
    return this.postponedExpenseService.findAll(req.user.userId);
  }

  @Get(':id')
  @GetOnePostponedExpenseSwagger()
  findOne(@Param('id') id: string, @Request() req) {
    return this.postponedExpenseService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @UpdatePostponedExpenseSwagger()
  update(@Param('id') id: string, @Body() updateDto: PostponedExpenseInputDto, @Request() req) {
    return this.postponedExpenseService.update(id, updateDto, req.user.userId);
  }

  @Delete(':id')
  @DeletePostponedExpenseSwagger()
  remove(@Param('id') id: string, @Request() req) {
    return this.postponedExpenseService.remove(id, req.user.userId);
  }
}
