import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { HabitsModule } from '../habits/habits.module';
import { EntriesModule } from '../entries/entries.module';
import { StatsModule } from '../stats/stats.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/habit-tracker'
    ),
    ScheduleModule.forRoot(),
    HabitsModule,
    EntriesModule,
    StatsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
