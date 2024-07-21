import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FamilyBudgetDocument = HydratedDocument<FamilyBudget>;

@Schema()
export class FamilyBudget {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  @Prop({ required: true, type: [Types.ObjectId], ref: 'User' })
  members: Types.ObjectId[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const FamilyBudgetSchema = SchemaFactory.createForClass(FamilyBudget);
