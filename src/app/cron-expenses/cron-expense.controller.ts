import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CronExpenseService } from './cron-expense.service';
import { CronExpenseInputDto } from './dto/cron-expense-input.dto';
import { CronExpense } from './models/cron-expense.model';
import { CreateCronExpenseSwDec } from './decorators/create-cron-expense-sw.decorator';
import { UpdateCronExpenseSwDec } from './decorators/update-cron-expense-sw.decorator';
import { DeleteCronExpenseSwDec } from './decorators/delete-cron-expense-sw.decorator';
import { FindCronExpenseSwDec } from './decorators/find-cron-expense-sw.decorator';
import { FindCronExpenseByIdSwDec } from './decorators/find-cron-expense-by-id-sw.decorator';
import { ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { CustomRequest } from '../../common/interfaces/token.interface';

@UseGuards(AccessJwtGuard)
@ApiTags('Cron Expenses')
@Controller('cron-expenses')
export class CronExpenseController {
  constructor(private readonly cronExpenseService: CronExpenseService) {}

  @CreateCronExpenseSwDec()
  @Post()
  async create(@Body() cronExpenseDto: CronExpenseInputDto, @Req() req: CustomRequest): Promise<CronExpense> {
    return this.cronExpenseService.create(cronExpenseDto, req.user.userId);
  }

  @FindCronExpenseSwDec()
  @Get()
  async findOwn(@Req() req: CustomRequest): Promise<CronExpense[]> {
    return this.cronExpenseService.findOwn(req.user.userId);
  }

  @FindCronExpenseByIdSwDec()
  @Get(':id')
  async findById(@Param('id') id: string, @Req() req: CustomRequest): Promise<CronExpense> {
    return this.cronExpenseService.findById(id, req.user.userId);
  }

  @UpdateCronExpenseSwDec()
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() cronExpenseDto: CronExpenseInputDto,
    @Req() req: CustomRequest,
  ): Promise<CronExpense> {
    return this.cronExpenseService.update(id, cronExpenseDto, req.user.userId);
  }

  @DeleteCronExpenseSwDec()
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: CustomRequest): Promise<void> {
    return this.cronExpenseService.delete(id, req.user.userId);
  }
}
