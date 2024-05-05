import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @IsOptional()
  @Prop()
  login?: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ default: Date.now })
  loginDate: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
