import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CustomRequest } from '../common/interfaces/token.interface';
import { CategoryService } from './category.service';
import { AccessJwtGuard } from '../auth/guards/access-jwt.guard';
import { GetCategorySwaggerDecorators } from './decorators/get-category-swagger-decorator';
import { ApiTags } from '@nestjs/swagger';
import { CategoryInputDto } from './dto/category-input.dto';
import { CreateCategorySwaggerDecorators } from './decorators/create-category-swagger-decorator';
import { Category } from './models/category.model';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @GetCategorySwaggerDecorators()
  @Get()
  @UseGuards(AccessJwtGuard)
  async get(@Req() req: CustomRequest) {
    return this.categoryService.get(req.user.userId);
  }

  @CreateCategorySwaggerDecorators()
  @Post('create')
  @UseGuards(AccessJwtGuard)
  async create(@Body() dto: CategoryInputDto, @Req() req: CustomRequest): Promise<Category> {
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
