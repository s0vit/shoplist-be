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
import { UpdateCategoryOrderSwDec } from './decorators/update-categoryoder-sw-decorator';
import { CategoryUpdateOrderDto } from './dto/category-update-order.dto';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @GetCategorySwDec()
  @Get()
  async getAll(@Req() req: CustomRequest): Promise<CategoryOutputDto[]> {
    const accessToken = req.headers['authorization']?.split(' ')?.[1];

    return this.categoryService.getAll(accessToken);
  }

  @GetByCategoryIdSwDec()
  @Get(':categoryId')
  async getOne(
    @ValidMongoIdInParamsDec({ param: 'categoryId' })
    categoryId: string,
    @Req() req: CustomRequest,
  ): Promise<CategoryOutputDto> {
    const accessToken = req.headers['authorization']?.split(' ')?.[1];

    return this.categoryService.getOne(categoryId, accessToken);
  }

  @UseGuards(AccessJwtGuard)
  @CreateCategorySwDec()
  @Post()
  async create(@Body() inputDTO: CategoryInputDto, @Req() req: CustomRequest): Promise<CategoryOutputDto> {
    return this.categoryService.create(inputDTO, req.user.userId);
  }

  @UseGuards(AccessJwtGuard)
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

  @UseGuards(AccessJwtGuard)
  @DeleteCategorySwDec()
  @Delete(':categoryId')
  async delete(
    @ValidMongoIdInParamsDec({ param: 'categoryId' }) categoryId: string,
    @Req() req: CustomRequest,
  ): Promise<CategoryOutputDto> {
    return this.categoryService.delete(categoryId, req.user.userId);
  }

  @UpdateCategoryOrderSwDec()
  @UseGuards(AccessJwtGuard)
  @Put(':categoryId/order')
  async updateOrder(
    @ValidMongoIdInParamsDec({ param: 'categoryId' }) categoryId: string,
    @Body() newOrder: CategoryUpdateOrderDto,
    @Req() req: CustomRequest,
  ): Promise<CategoryOutputDto> {
    return this.categoryService.updateOrder(categoryId, newOrder.order, req.user.userId);
  }
}
