import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './models/category.model';
import { CategoryInputDto } from './dto/category-input.dto';
import { CATEGORY_ERROR } from './constants/category-error.enum';
import { CategoryOutputDto } from './dto/category-output.dto';
import { UtilsService } from '../../common/utils/utils.service';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly utilsService: UtilsService,
  ) {}

  async getAll(userId: string): Promise<CategoryOutputDto[]> {
    try {
      return await this.categoryModel.find({ userId }).select('-__v').lean();
    } catch (error) {
      throw new HttpException(CATEGORY_ERROR.GET_CATEGORY_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async getOne(categoryId: string, userId: string): Promise<CategoryOutputDto> {
    const category = await this.categoryModel.findById(categoryId);

    if (!category) {
      throw new NotFoundException(CATEGORY_ERROR.CATEGORY_NOT_FOUND);
    }

    if (category.userId !== userId) {
      throw new UnauthorizedException(CATEGORY_ERROR.FORBIDDEN);
    }

    return category.toObject({ versionKey: false });
  }
  async create(inputDTO: CategoryInputDto, userId: string): Promise<CategoryOutputDto> {
    const titleToSearch = this.utilsService.createTitleRegex(inputDTO.title);
    const category = await this.categoryModel.findOne({ title: titleToSearch, userId });

    if (category) {
      throw new NotFoundException(CATEGORY_ERROR.CATEGORY_ALREADY_EXIST);
    }

    try {
      const newCategoryInstance = new this.categoryModel({
        userId,
        title: inputDTO.title,
        comments: inputDTO.comments,
        color: inputDTO.color,
      });
      const createdCategory = await newCategoryInstance.save();

      return createdCategory.toObject({ versionKey: false });
    } catch (error) {
      throw new HttpException(CATEGORY_ERROR.CREATE_CATEGORY_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async update(categoryId: string, inputDTO: CategoryInputDto, userId: string): Promise<CategoryOutputDto> {
    const category = await this.categoryModel.findById(categoryId);

    if (!category) {
      throw new NotFoundException(CATEGORY_ERROR.CATEGORY_NOT_FOUND);
    }

    if (category.userId !== userId) {
      throw new UnauthorizedException(CATEGORY_ERROR.FORBIDDEN);
    }

    try {
      category.set({
        title: inputDTO.title,
        comments: inputDTO.comments,
        color: inputDTO.color,
      });
      await category.save();

      return category.toObject({ versionKey: false });
    } catch (error) {
      throw new HttpException(CATEGORY_ERROR.UPDATE_CATEGORY_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async delete(categoryId: string, userId: string): Promise<CategoryOutputDto> {
    const category = await this.categoryModel.findById(categoryId);

    if (!category) {
      throw new NotFoundException(CATEGORY_ERROR.CATEGORY_NOT_FOUND);
    }

    if (category.userId !== userId) {
      throw new UnauthorizedException(CATEGORY_ERROR.FORBIDDEN);
    }

    try {
      await category.deleteOne();

      return category.toObject({ versionKey: false });
    } catch (error) {
      throw new HttpException(CATEGORY_ERROR.DELETE_CATEGORY_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createDefaultCategories(userId: string): Promise<void> {
    const defaultCategories = [
      { title: 'Food', color: '#4faa4f' },
      { title: 'Transport', color: '#568180' },
      { title: 'Entertainment', color: '#8400ff' },
      { title: 'Rent', color: '#ff0062' },
      { title: 'Other', color: '#373737' },
    ];

    for (const category of defaultCategories) {
      const titleToSearch = this.utilsService.createTitleRegex(category.title);
      const existingCategory = await this.categoryModel.findOne({ title: titleToSearch, userId });

      if (existingCategory) continue;
      const newCategory = new this.categoryModel({
        userId,
        title: category.title,
        color: category.color,
      });
      await newCategory.save();
    }
  }
}
