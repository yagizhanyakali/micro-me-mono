import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HabitsModule } from '../habits/habits.module';
import { EntriesModule } from '../entries/entries.module';
import { StatsModule } from '../stats/stats.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/habit-tracker'
    ),
    HabitsModule,
    EntriesModule,
    StatsModule,
  ],
})
export class AppModule {}
