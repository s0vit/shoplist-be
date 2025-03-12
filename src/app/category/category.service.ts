import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './models/category.model';
import { CategoryInputDto } from './dto/category-input.dto';
import { CATEGORY_ERROR } from './constants/category-error.enum';
import { CategoryOutputDto } from './dto/category-output.dto';
import { UtilsService } from '../../common/utils/utils.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    private readonly utilsService: UtilsService,
    private readonly jwtService: JwtService,
  ) {}

  async getAll(accessToken: string): Promise<CategoryOutputDto[]> {
    if (!accessToken) {
      throw new BadRequestException('Access token is missing');
    }

    const userId = this.jwtService.decode(accessToken).userId;

    try {
      const results = await this.categoryModel.find({ userId }).select('-__v').lean();

      return results.map((doc) => ({
        _id: doc._id.toString(),
        userId: doc.userId.toString(),
        title: doc.title,
        color: doc.color,
        comments: doc.comments || '',
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        order: doc.order,
      }));
    } catch (error) {
      throw new HttpException(CATEGORY_ERROR.GET_CATEGORY_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOne(categoryId: string, accessToken: string): Promise<CategoryOutputDto> {
    if (!accessToken) {
      throw new BadRequestException('Access token is missing');
    }

    const userId = this.jwtService.decode(accessToken).userId;
    const category = await this.categoryModel.findById(categoryId);

    if (!category) {
      throw new NotFoundException(CATEGORY_ERROR.CATEGORY_NOT_FOUND);
    }

    if (category.userId !== userId) {
      throw new UnauthorizedException(CATEGORY_ERROR.FORBIDDEN);
    }

    const result = category.toObject({ versionKey: false });

    return {
      _id: result._id.toString(),
      userId: result.userId.toString(),
      title: result.title,
      color: result.color,
      comments: result.comments || '',
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      order: result.order,
    };
  }

  async create(inputDTO: CategoryInputDto, userId: string): Promise<CategoryOutputDto> {
    const titleToSearch = this.utilsService.createCaseInsensitiveRegexFromString(inputDTO.title);
    const category = await this.categoryModel.findOne({ title: titleToSearch, userId });

    if (category) {
      throw new NotFoundException(CATEGORY_ERROR.CATEGORY_ALREADY_EXIST);
    }

    try {
      const newCategoryInstance = new this.categoryModel({
        userId,
        title: inputDTO.title,
        comments: inputDTO.comments || '',
        color: inputDTO.color,
        order: await this.categoryModel.countDocuments({ userId }),
      });
      const createdCategory = await newCategoryInstance.save();
      const result = createdCategory.toObject({ versionKey: false });

      return {
        _id: result._id.toString(),
        userId: result.userId.toString(),
        title: result.title,
        color: result.color,
        comments: result.comments || '',
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        order: result.order,
      };
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
        comments: inputDTO.comments || '',
        color: inputDTO.color,
      });
      await category.save();
      const result = category.toObject({ versionKey: false });

      return {
        _id: result._id.toString(),
        userId: result.userId.toString(),
        title: result.title,
        color: result.color,
        comments: result.comments || '',
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        order: result.order,
      };
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
      const result = category.toObject({ versionKey: false });

      return {
        _id: result._id.toString(),
        userId: result.userId.toString(),
        title: result.title,
        color: result.color,
        comments: result.comments || '',
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        order: result.order,
      };
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

    const titlesToSearch = defaultCategories.map((category) =>
      this.utilsService.createCaseInsensitiveRegexFromString(category.title),
    );

    const existingCategories = await this.categoryModel.find({
      title: { $in: titlesToSearch },
      userId,
    });

    const existingTitles = new Set(existingCategories.map((category) => category.title));

    const newCategories = defaultCategories
      .filter((category) => !existingTitles.has(category.title))
      .map((category) => ({
        userId,
        title: category.title,
        color: category.color,
      }));

    if (newCategories.length > 0) {
      await this.categoryModel.insertMany(newCategories);
    }
  }

  async updateOrder(id: string, newOrder: number, userId: string): Promise<CategoryOutputDto> {
    const category = await this.categoryModel.findById(id);

    if (!category) {
      throw new NotFoundException(CATEGORY_ERROR.CATEGORY_NOT_FOUND);
    }

    if (category.userId !== userId) {
      throw new UnauthorizedException(CATEGORY_ERROR.FORBIDDEN);
    }

    try {
      await category.save();

      // if we move category up, we need to decrement order of all categories from old order to new order
      // if we move category down, we need to increment order of all categories from new order to old order
      const increment = category.order > newOrder ? 1 : -1;
      const condition =
        category.order > newOrder ? { $lte: category.order, $gte: newOrder } : { $gte: category.order, $lte: newOrder };

      await this.categoryModel.updateMany({ userId, order: condition }, { $inc: { order: increment } });

      category.set({ order: newOrder });
      await category.save();
      const result = category.toObject({ versionKey: false });

      return {
        _id: result._id.toString(),
        userId: result.userId.toString(),
        title: result.title,
        color: result.color,
        comments: result.comments || '',
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        order: result.order,
      };
    } catch (error) {
      throw new HttpException(CATEGORY_ERROR.UPDATE_CATEGORY_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
