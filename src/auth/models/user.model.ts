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

  @Prop({ default: Date.now })
  createdAt: Date;

  @IsOptional()
  @Prop()
  loginDate?: Date;

  @IsOptional()
  @Prop({ default: false })
  isVerified?: boolean;

  @IsOptional()
  @Prop({ default: null })
  accessToken?: string | null;

  @IsOptional()
  @Prop({ default: null })
  refreshToken?: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
