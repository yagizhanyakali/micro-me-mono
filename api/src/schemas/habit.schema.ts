import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Habit extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  userId!: string;

  @Prop({ default: '✓' })
  emoji!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export const HabitSchema = SchemaFactory.createForClass(Habit);

