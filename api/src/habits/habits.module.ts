import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HabitsController } from './habits.controller';
import { HabitsService } from './habits.service';
import { Habit, HabitSchema } from '../schemas/habit.schema';
import { Entry, EntrySchema } from '../schemas/entry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Habit.name, schema: HabitSchema },
      { name: Entry.name, schema: EntrySchema },
    ]),
  ],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService],
})
export class HabitsModule {}

