import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Entry extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Habit' })
  habitId!: Types.ObjectId;

  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  date!: string; // Format: YYYY-MM-DD
}

export const EntrySchema = SchemaFactory.createForClass(Entry);

// Create compound index for efficient queries
EntrySchema.index({ habitId: 1, date: 1 }, { unique: true });
EntrySchema.index({ userId: 1, date: 1 });

