import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './models/category.model';
import { CategoryService } from './category.service';
import { ConfigModule } from '@nestjs/config';
import { UtilsService } from '../../common/utils/utils.service';
import { AccessJwtStrategy } from '../auth/strategies/access-jwt.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema, collection: 'Category' }]),
    ConfigModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService, UtilsService, AccessJwtStrategy],
})
export class CategoryModule {}
