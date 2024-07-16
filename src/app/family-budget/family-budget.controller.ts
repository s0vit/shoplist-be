import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomRequest } from 'src/common/interfaces/token.interface';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { CreateFamilyBudgetSwDec } from './decorators/create-family-budget-sw.decorator';
import { GetFamilyBudgetByIdSwDec } from './decorators/get-family-budget-sw.decorator';
import { UpdateFamilyBudgetSwDec } from './decorators/update-family-budget-sw.decorator';
import { CreateFamilyBudgetDto } from './dto/family-budget-input.dto';
import { UpdateFamilyBudgetDto } from './dto/family-budget-update.dto';
import { FamilyBudgetService } from './family-budget.service';

@UseGuards(AccessJwtGuard)
@ApiTags('FamilyBudget')
@Controller('family-budget')
export class FamilyBudgetController {
  constructor(private readonly familyBudgetService: FamilyBudgetService) {}

  @CreateFamilyBudgetSwDec()
  @Post()
  async create(@Body() createFamilyBudgetDto: CreateFamilyBudgetDto, @Req() req: CustomRequest) {
    return this.familyBudgetService.create(createFamilyBudgetDto, req.user.userId);
  }

  @GetFamilyBudgetByIdSwDec()
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: CustomRequest) {
    return this.familyBudgetService.findOne(id, req.user.userId);
  }

  @UpdateFamilyBudgetSwDec()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFamilyBudgetDto: UpdateFamilyBudgetDto,
    @Req() req: CustomRequest,
  ) {
    return this.familyBudgetService.update(id, updateFamilyBudgetDto, req.user.userId);
  }
}
