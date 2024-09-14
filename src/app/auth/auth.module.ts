import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { getMailerConfig } from '../../configs/get-mailer.config';
import { jwtConfig } from '../../configs/jwt.config';
import { CategoryModule } from '../category/category.module';
import { PaymentSourcesModule } from '../payment-source/payment-sources.module';
import { User, UserSchema } from '../user/models/user.model';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UtilsService } from '../../common/utils/utils.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: 'User' }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: jwtConfig,
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMailerConfig,
    }),
    ConfigModule,
    PaymentSourcesModule,
    CategoryModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UtilsService],
})
export class AuthModule {}
