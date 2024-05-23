import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AccessControlDocument = HydratedDocument<AccessControl>;

@Schema()
export class AccessControl {
  _id: Types.ObjectId;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: true })
  sharedWith: string;

  @Prop()
  expenseIds: string[];
}

export const AccessControlSchema = SchemaFactory.createForClass(AccessControl);
