import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CustomRequest } from '../../common/interfaces/token.interface';
import { CategoryService } from './category.service';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { GetCategorySwDec } from './decorators/get-category-sw.decorator';
import { ApiTags } from '@nestjs/swagger';
import { CreateCategoryInputDto } from './dto/create-category-input.dto';
import { CreateCategorySwDec } from './decorators/create-category-sw.decorator';
import { Category } from './models/category.model';

@UseGuards(AccessJwtGuard)
@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @GetCategorySwDec()
  @Get()
  async get(@Req() req: CustomRequest) {
    return this.categoryService.get(req.user.userId);
  }

  @CreateCategorySwDec()
  @Post('create')
  async create(@Body() dto: CreateCategoryInputDto, @Req() req: CustomRequest): Promise<Category> {
    return this.categoryService.create(dto, req.user.userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return id;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body('name') name: string) {
    return { id, name };
  }
}
