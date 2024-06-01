import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './models/category.model';
import { CreateCategoryInputDto } from './dto/create-category-input.dto';
import { CATEGORY_ERROR } from './constants/category-error.enum';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
  ) {}

  async get(userId: string) {
    return 'GET api/category - userId: ' + userId;
  }
  async create(category: CreateCategoryInputDto, userId: string) {
    try {
      const newCategoryInstance = new this.categoryModel({
        userId,
        title: category.title,
        comments: category.comments,
      });
      const createdCategory = await newCategoryInstance.save();
      return createdCategory.toObject({ versionKey: false });
    } catch (error) {
      throw new HttpException(CATEGORY_ERROR.CREATE_CATEGORY_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async update() {}
  async delete() {}
}
