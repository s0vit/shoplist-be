import { Module } from '@nestjs/common';
import { PaymentSourcesController } from './payment-sources.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSource, PaymentSourceSchema } from './models/payment-source.model';
import { PaymentSourcesService } from './payment-sources.service';
import { User, UserSchema } from '../auth/models/user.model';

@Module({
  controllers: [PaymentSourcesController],
  imports: [
    MongooseModule.forFeature([{ name: PaymentSource.name, schema: PaymentSourceSchema, collection: 'PaymentSource' }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema, collection: 'User' }]),
  ],
  providers: [PaymentSourcesService],
})
export class PaymentSourcesModule {}
