import { Module } from '@nestjs/common';
import { PaymentSourcesController } from './payment-sources.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSource, PaymentSourceSchema } from './models/payment-source.model';
import { PaymentSourcesService } from './payment-sources.service';
import { User, UserSchema } from '../auth/models/user.model';
import { UtilsService } from '../../common/utils/utils.service';

@Module({
  controllers: [PaymentSourcesController],
  imports: [
    MongooseModule.forFeature([{ name: PaymentSource.name, schema: PaymentSourceSchema, collection: 'PaymentSource' }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: 'User' }]),
  ],
  exports: [UtilsService],
  providers: [PaymentSourcesService, UtilsService],
})
export class PaymentSourcesModule {}
