import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.model';
import { AuthService } from './auth.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getMailerConfig } from '../configs/get-mailer.config';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from '../configs/jwt.config';

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
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
