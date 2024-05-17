import { HydratedDocument, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema()
export class Category {
  _id: Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  userId: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
