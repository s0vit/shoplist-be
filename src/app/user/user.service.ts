import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from '../auth/models/user.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FindByEmailOutputDto } from './dto/find-by-email-output.dto';
import { CreateDataInputDto } from './dto/create-data-input.dto';
import { QuantityInputDto } from './dto/quantity-input.dto';
import { Category, CategoryDocument } from '../category/models/category.model';
import { CategoryOutputDto } from '../category/dto/category-output.dto';
import { UtilsService } from '../../common/utils/utils.service';
import { PaymentSource, PaymentSourceDocument } from '../payment-source/models/payment-source.model';
import { ConfigService } from '@nestjs/config';
import { USER_ERROR } from './constants/user-error.enum';
import { Expense } from '../expense/models/expense.model';

@Injectable()
export class UserService {
  private readonly arrayAllowedUsers: string[];
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(PaymentSource.name) private readonly paymentSourceModel: Model<PaymentSourceDocument>,
    @InjectModel(Expense.name) private readonly expensesModel: Model<Expense>,
    private readonly utilsService: UtilsService,
    private readonly configService: ConfigService,
  ) {
    this.arrayAllowedUsers = this.configService.get<string[]>('ALLOWED_USERS');
  }

  async findByEmail(email: string): Promise<FindByEmailOutputDto[]> {
    const emailRegex = new RegExp(email, 'i');
    return this.userModel
      .find({ email: emailRegex })
      .select(['email', '_id', 'login', 'isVerified', 'loginDate'])
      .lean();
  }

  private getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  private getDateMinusDays(days: number): Date {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);
    return pastDate;
  }
  private createRandomCategoryOrPaymentSource(usersId: string, names: string[]): CategoryOutputDto[] {
    const pastDate = this.getDateMinusDays(32);
    const result = [];
    for (let i = 0; i < names.length; i++) {
      result.push({
        title: names[i],
        userId: usersId,
        color: this.getRandomColor(),
        comments: `some comments_${i + 1}`,
        createdAt: pastDate,
        updatedAt: pastDate,
      });
    }
    return result;
  }
  private getRandomDate(startDate: Date) {
    const start = new Date(startDate);
    const randomDays = Math.floor(Math.random() * 31);
    start.setDate(start.getDate() + randomDays);
    return start;
  }
  private getRandomNumber() {
    return Math.floor(Math.random() * 100) + 1;
  }
  private getRandomElement(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  private async makeRandomExpenses(usersId: string, count: number) {
    const result = [];
    const foundCategories = await this.categoryModel.find({ userId: usersId });
    const foundPaymentSources = await this.categoryModel.find({ userId: usersId });
    const categoriesIds = foundCategories.map((category) => category._id);
    const paymentSourceIds = foundPaymentSources.map((paymentSource) => paymentSource._id);
    const cratedDate = foundCategories[0].createdAt;

    for (let i = 0; i < count; i++) {
      const randomDate = this.getRandomDate(cratedDate);
      result.push({
        amount: this.getRandomNumber(),
        userId: usersId,
        categoryId: this.getRandomElement(categoriesIds),
        paymentSourceId: this.getRandomElement(paymentSourceIds),
        comments: `Some comments_${i + 1}`,
        createdAt: randomDate,
        updatedAt: randomDate,
      });
    }
    return result;
  }

  async createCategoryAndPaymentSource(inputDataDto: CreateDataInputDto, userId: string): Promise<void> {
    const categoryData = this.createRandomCategoryOrPaymentSource(userId, inputDataDto.categories);
    const paymentSourceData = this.createRandomCategoryOrPaymentSource(userId, inputDataDto.paymentSources);
    const categoryTitleToSearch = this.utilsService.createTitleRegex(categoryData[0].title);
    const paymentSrcTitleToSearch = this.utilsService.createTitleRegex(paymentSourceData[0].title);
    const category = await this.categoryModel.findOne({ title: categoryTitleToSearch, userId });
    const paymentSource = await this.categoryModel.findOne({ title: paymentSrcTitleToSearch, userId });
    if (category || paymentSource) {
      throw new NotFoundException(USER_ERROR.CATEGORY_OR_PAYMENT_SOURCE_ALREADY_EXIST);
    }
    try {
      await this.categoryModel.insertMany(categoryData);
      await this.paymentSourceModel.insertMany(paymentSourceData);
    } catch (error) {
      throw new HttpException(USER_ERROR.CREATE_CATEGORY_AND_PAYMENT_SOURCE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  async createRandomExpenses(inputDataDto: QuantityInputDto, userId: string) {
    if (!this.arrayAllowedUsers.includes(userId)) {
      throw new NotFoundException(USER_ERROR.FORBIDDEN);
    }
    try {
      const expensesData = await this.makeRandomExpenses(userId, inputDataDto.quantity);
      return await this.expensesModel.insertMany(expensesData);
    } catch (error) {
      throw new HttpException(USER_ERROR.CREATE_EXPENSES_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
