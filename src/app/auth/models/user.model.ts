import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  _id: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  login?: string;

  @Prop({ default: false })
  isVerified?: boolean;

  @Prop({ default: null })
  lastVerificationRequest?: Date;

  @Prop({ default: null })
  accessToken?: string | null;

  @Prop({ default: null })
  refreshToken?: string | null;

  @Prop()
  loginDate?: Date;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  resetPasswordToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
