import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Entry } from '../schemas/entry.schema';
import { Habit } from '../schemas/habit.schema';

interface HeatmapData {
  date: string;
  count: number;
}

interface StreakData {
  habitId: string;
  name: string;
  streak: number;
}

@Injectable()
export class StatsService {
  constructor(
    @InjectModel(Entry.name) private entryModel: Model<Entry>,
    @InjectModel(Habit.name) private habitModel: Model<Habit>
  ) {}

  async getHeatmap(userId: string, days = 60): Promise<HeatmapData[]> {
    // Calculate the start date
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Aggregate entries by date
    const aggregation = await this.entryModel.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startDateStr, $lte: endDateStr },
        },
      },
      {
        $group: {
          _id: '$date',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Transform to the expected format
    const heatmapData = aggregation.map((item) => ({
      date: item._id,
      count: item.count,
    }));

    // Fill in missing dates with count: 0
    const result: HeatmapData[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existing = heatmapData.find((item) => item.date === dateStr);

      result.push({
        date: dateStr,
        count: existing ? existing.count : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return result;
  }

  async getStreaks(userId: string): Promise<StreakData[]> {
    // Get all habits for the user
    const habits = await this.habitModel.find({ userId }).exec();

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const streaksData: StreakData[] = [];

    for (const habit of habits) {
      let streak = 0;
      let checkDate = new Date(today);
      let skippedToday = false;

      // Start checking from today going backwards
      while (true) {
        const checkDateStr = checkDate.toISOString().split('T')[0];

        // Check if there's an entry for this date
        const entry = await this.entryModel
          .findOne({
            habitId: habit._id,
            date: checkDateStr,
          })
          .exec();

        if (!entry) {
          // Allow skipping today (grace day) - user might not have done it yet
          if (checkDateStr === todayStr && !skippedToday) {
            skippedToday = true;
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
          }
          // Streak is broken
          break;
        }

        // Found an entry, increment streak and go to previous day
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      streaksData.push({
        habitId: habit._id.toString(),
        name: habit.name,
        streak,
      });
    }

    return streaksData;
  }
}

