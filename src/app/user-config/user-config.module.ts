import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserConfig, UserConfigSchema } from './model/user-config.model';
import { UserConfigController } from './user-config.controller';
import { UserConfigService } from './user-config.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserConfig.name, schema: UserConfigSchema, collection: 'UserConfig' }])],
  providers: [UserConfigService],
  controllers: [UserConfigController],
})
export class UserConfigModule {}
