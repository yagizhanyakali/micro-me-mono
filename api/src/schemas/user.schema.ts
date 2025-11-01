import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document<string> {
  @Prop({ required: true, unique: true })
  userId!: string; // Firebase UID

  @Prop({ type: [String], default: [] })
  fcmTokens!: string[]; // Array of FCM tokens (user may have multiple devices)

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

