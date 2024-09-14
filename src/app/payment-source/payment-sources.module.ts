import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsService } from '../../common/utils/utils.service';
import { AccessJwtStrategy } from '../auth/strategies/access-jwt.strategy';
import { User, UserSchema } from '../user/models/user.model';
import { PaymentSource, PaymentSourceSchema } from './models/payment-source.model';
import { PaymentSourceController } from './payment-source.controller';
import { PaymentSourceService } from './payment-source.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [PaymentSourceController],
  imports: [
    MongooseModule.forFeature([{ name: PaymentSource.name, schema: PaymentSourceSchema, collection: 'PaymentSource' }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: 'User' }]),
    ConfigModule,
  ],
  providers: [PaymentSourceService, UtilsService, AccessJwtStrategy, JwtService],
  exports: [UtilsService, PaymentSourceService],
})
export class PaymentSourcesModule {}
