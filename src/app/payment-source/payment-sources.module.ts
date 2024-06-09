import { Module } from '@nestjs/common';
import { PaymentSourceController } from './payment-source.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSource, PaymentSourceSchema } from './models/payment-source.model';
import { PaymentSourceService } from './payment-source.service';
import { User, UserSchema } from '../auth/models/user.model';
import { UtilsService } from '../../common/utils/utils.service';
import { ConfigModule } from '@nestjs/config';
import { AccessJwtStrategy } from '../auth/strategies/access-jwt.strategy';

@Module({
  controllers: [PaymentSourceController],
  imports: [
    MongooseModule.forFeature([{ name: PaymentSource.name, schema: PaymentSourceSchema, collection: 'PaymentSource' }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: 'User' }]),
    ConfigModule,
  ],
  exports: [UtilsService],
  providers: [PaymentSourceService, UtilsService, AccessJwtStrategy],
})
export class PaymentSourcesModule {}
