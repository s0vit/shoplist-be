import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @IsOptional()
  @Prop()
  login?: string;

  @IsOptional()
  @Prop({ default: false })
  isVerified?: boolean;

  @IsOptional()
  @Prop({ default: null })
  accessToken?: string | null;

  @IsOptional()
  @Prop({ default: null })
  refreshToken?: string | null;

  @IsOptional()
  @Prop()
  loginDate?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
