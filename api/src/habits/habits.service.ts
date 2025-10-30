import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Habit } from '../schemas/habit.schema';
import { Entry } from '../schemas/entry.schema';
import { CreateHabitDto } from '../dto/create-habit.dto';

@Injectable()
export class HabitsService {
  constructor(
    @InjectModel(Habit.name) private habitModel: Model<Habit>,
    @InjectModel(Entry.name) private entryModel: Model<Entry>
  ) {}

  async create(createHabitDto: CreateHabitDto, userId: string): Promise<Habit> {
    // Check if user already has 4 habits
    const habitCount = await this.habitModel.countDocuments({ userId });
    if (habitCount >= 4) {
      throw new BadRequestException(
        'You have reached the maximum limit of 4 habits'
      );
    }

    const habit = new this.habitModel({
      ...createHabitDto,
      userId,
      createdAt: new Date(),
    });

    return habit.save();
  }

  async findAll(userId: string): Promise<Habit[]> {
    return this.habitModel.find({ userId }).sort({ createdAt: 1 }).exec();
  }

  async remove(id: string, userId: string): Promise<void> {
    // Validate ObjectId
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid habit ID');
    }

    const result = await this.habitModel
      .deleteOne({ _id: id, userId })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Habit not found');
    }

    // Delete all associated entries
    await this.entryModel.deleteMany({ habitId: new Types.ObjectId(id) }).exec();
  }
}

