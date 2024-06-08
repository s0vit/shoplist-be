import { Body, Controller, Delete, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { CustomRequest } from '../../common/interfaces/token.interface';
import { CategoryService } from './category.service';
import { AccessJwtGuard } from '../../guards/access-jwt.guard';
import { GetCategorySwDec } from './decorators/get-category-sw.decorator';
import { ApiTags } from '@nestjs/swagger';
import { CategoryInputDto } from './dto/category-input.dto';
import { CreateCategorySwDec } from './decorators/create-category-sw.decorator';
import { UpdateCategorySwDec } from './decorators/update-category-sw.decorator';
import { CategoryOutputDto } from './dto/category-output.dto';
import { GetByCategoryIdSwDec } from './decorators/get-by-category-id-sw.decorator';
import { DeleteCategorySwDec } from './decorators/delete-category-sw.decorator';
import { ValidMongoIdInParamsDec } from '../../common/decorators/valid-mongo-id.decorator';

@UseGuards(AccessJwtGuard)
@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @GetCategorySwDec()
  @Get()
  async getAll(@Req() req: CustomRequest): Promise<CategoryOutputDto[]> {
    return this.categoryService.getAll(req.user.userId);
  }

  @GetByCategoryIdSwDec()
  @Get(':categoryId')
  async getOne(
    @ValidMongoIdInParamsDec({ param: 'categoryId' })
    categoryId: string,
    @Req() req: CustomRequest,
  ): Promise<CategoryOutputDto> {
    return this.categoryService.getOne(categoryId, req.user.userId);
  }

  @CreateCategorySwDec()
  @Post()
  async create(@Body() inputDTO: CategoryInputDto, @Req() req: CustomRequest): Promise<CategoryOutputDto> {
    return this.categoryService.create(inputDTO, req.user.userId);
  }

  @UpdateCategorySwDec()
  @Put(':categoryId')
  async update(
    @ValidMongoIdInParamsDec({ param: 'categoryId' })
    categoryId: string,
    @Body() inputDTO: CategoryInputDto,
    @Req() req: CustomRequest,
  ): Promise<CategoryOutputDto> {
    return this.categoryService.update(categoryId, inputDTO, req.user.userId);
  }

  @DeleteCategorySwDec()
  @Delete(':categoryId')
  async delete(
    @ValidMongoIdInParamsDec({ param: 'categoryId' }) categoryId: string,
    @Req() req: CustomRequest,
  ): Promise<CategoryOutputDto> {
    return this.categoryService.delete(categoryId, req.user.userId);
  }
}
