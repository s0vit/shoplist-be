import { Module } from '@nestjs/common';
import { PaymentSourceController } from './payment-source.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSource, PaymentSourceSchema } from './models/payment-source.model';
import { PaymentSourceService } from './payment-source.service';
import { User, UserSchema } from '../auth/models/user.model';
import { UtilsService } from '../../common/utils/utils.service';

@Module({
  controllers: [PaymentSourceController],
  imports: [
    MongooseModule.forFeature([{ name: PaymentSource.name, schema: PaymentSourceSchema, collection: 'PaymentSource' }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: 'User' }]),
  ],
  exports: [UtilsService],
  providers: [PaymentSourceService, UtilsService],
})
export class PaymentSourcesModule {}
