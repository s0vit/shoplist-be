import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserConfigDocument = HydratedDocument<UserConfig>;

@Schema()
export class UserConfig {
  _id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  theme: string;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  language: string;

  @Prop({ required: true })
  showCategoryNames: boolean;

  @Prop({ required: true })
  showSourceNames: boolean;

  @Prop({ required: true })
  showSharedExpenses: boolean;

  @Prop({ required: true })
  showSharedCategories: boolean;

  @Prop({ required: true })
  showSharedSources: boolean;

  @Prop({ required: true })
  showCategoryColours: boolean;

  @Prop({ required: true })
  showSourceColours: boolean;
}

export const UserConfigSchema = SchemaFactory.createForClass(UserConfig);
