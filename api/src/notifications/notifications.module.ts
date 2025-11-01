import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Habit, HabitSchema } from '../schemas/habit.schema';
import { Entry, EntrySchema } from '../schemas/entry.schema';

@Module({
  imports: [
    // @ts-expect-error - Complex Mongoose type inference issue
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Habit.name, schema: HabitSchema },
      { name: Entry.name, schema: EntrySchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

