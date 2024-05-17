import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './models/category.model';

@Module({
  controllers: [CategoryController],
  imports: [MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])],
})
export class CategoryModule {}
