import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AccessControlDocument = HydratedDocument<AccessControl>;

@Schema()
export class AccessControl {
  _id: Types.ObjectId;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: true })
  sharedWith: string[];

  @Prop()
  expenseIds: string[];

  @Prop()
  categoryIds: string[];

  @Prop()
  paymentSourceIds: string[];

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const AccessControlSchema = SchemaFactory.createForClass(AccessControl);
