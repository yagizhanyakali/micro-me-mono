import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { Entry, EntrySchema } from '../schemas/entry.schema';
import { Habit, HabitSchema } from '../schemas/habit.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Entry.name, schema: EntrySchema },
      { name: Habit.name, schema: HabitSchema },
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}

