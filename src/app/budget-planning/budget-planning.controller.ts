import { Body, Controller, Delete, Get, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { BudgetPlanningService } from './budget-planning.service';
import { CreateBudgetPlanDto } from './dto/create-budget-plan.dto';
import { UpdateBudgetPlanDto } from './dto/update-budget-plan.dto';
import { ActivateBudgetPlanDto } from './dto/activate-budget-plan.dto';
import { BudgetPlanResponseDto } from './dto/budget-plan-response.dto';
import { BudgetAlertResponseDto } from './dto/budget-alert-response.dto';
import { CustomRequest } from '../../common/interfaces/token.interface';
import { ValidMongoIdInParamsDec } from '../../common/decorators/valid-mongo-id.decorator';
import { BudgetAlertQueryDto } from './dto/budget-alert-query.dto';
import { CreateBudgetPlanSwDec } from './decorators/create-budget-plan-sw.decorator';
import { UpdateBudgetPlanSwDec } from './decorators/update-budget-plan-sw.decorator';
import { DeleteBudgetPlanSwDec } from './decorators/delete-budget-plan-sw.decorator';
import { GetCurrentBudgetPlanSwDec } from './decorators/get-current-budget-plan-sw.decorator';
import { GetBudgetHistorySwDec } from './decorators/get-budget-history-sw.decorator';
import { ActivateBudgetPlanSwDec } from './decorators/activate-budget-plan-sw.decorator';
import { GetBudgetAlertsSwDec } from './decorators/get-budget-alerts-sw.decorator';

@UseGuards(AccessJwtGuard)
@ApiTags('Budget Planning')
@Controller('budget-planning')
export class BudgetPlanningController {
  constructor(private readonly budgetPlanningService: BudgetPlanningService) {}

  @CreateBudgetPlanSwDec()
  @Post()
  async createPlan(@Body() dto: CreateBudgetPlanDto, @Req() req: CustomRequest): Promise<BudgetPlanResponseDto> {
    return this.budgetPlanningService.createPlan(dto, req.user.userId);
  }

  @UpdateBudgetPlanSwDec()
  @Patch(':planId')
  async updatePlan(
    @ValidMongoIdInParamsDec({ param: 'planId' }) planId: string,
    @Body() dto: UpdateBudgetPlanDto,
    @Req() req: CustomRequest,
  ): Promise<BudgetPlanResponseDto> {
    return this.budgetPlanningService.updatePlan(planId, dto, req.user.userId);
  }

  @DeleteBudgetPlanSwDec()
  @Delete(':planId')
  async deletePlan(
    @ValidMongoIdInParamsDec({ param: 'planId' }) planId: string,
    @Req() req: CustomRequest,
  ): Promise<void> {
    return this.budgetPlanningService.deletePlan(planId, req.user.userId);
  }

  @GetCurrentBudgetPlanSwDec()
  @Get('current')
  async getCurrent(@Req() req: CustomRequest): Promise<BudgetPlanResponseDto | null> {
    return this.budgetPlanningService.getCurrentPlan(req.user.userId);
  }

  @GetBudgetHistorySwDec()
  @Get('history')
  async getHistory(@Req() req: CustomRequest): Promise<BudgetPlanResponseDto[]> {
    return this.budgetPlanningService.listHistory(req.user.userId);
  }

  @ActivateBudgetPlanSwDec()
  @Post(':planId/activate')
  async activatePlan(
    @ValidMongoIdInParamsDec({ param: 'planId' }) planId: string,
    @Body() dto: ActivateBudgetPlanDto,
    @Req() req: CustomRequest,
  ): Promise<BudgetPlanResponseDto> {
    return this.budgetPlanningService.activateFromHistory(planId, dto, req.user.userId);
  }

  @GetBudgetAlertsSwDec()
  @Get('alerts')
  async getAlerts(@Query() query: BudgetAlertQueryDto, @Req() req: CustomRequest): Promise<BudgetAlertResponseDto[]> {
    return this.budgetPlanningService.listAlerts(req.user.userId, query.planId);
  }
}
