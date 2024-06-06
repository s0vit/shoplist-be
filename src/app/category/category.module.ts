import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './models/category.model';
import { CategoryService } from './category.service';
import { PassportModule } from '@nestjs/passport';
import { AccessJwtStrategy } from '../auth/strategies/access-jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfig } from '../../configs/jwt.config';
import { UtilsService } from '../../common/utils/utils.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema, collection: 'Category' }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: jwtConfig,
    }),
    ConfigModule,
    PassportModule,
  ],
  exports: [UtilsService],
  controllers: [CategoryController],
  providers: [CategoryService, AccessJwtStrategy, UtilsService],
})
export class CategoryModule {}
