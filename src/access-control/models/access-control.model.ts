import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AccessControlDocument = HydratedDocument<AccessControl>;

@Schema()
export class AccessControl {
  _id: Types.ObjectId;

  @Prop()
  userId: string;

  @Prop()
  allowed: string[];
}

export const AccessControlSchema = SchemaFactory.createForClass(AccessControl);
