import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Entry } from '../schemas/entry.schema';
import { CreateEntryDto } from '../dto/create-entry.dto';
import { DeleteEntryDto } from '../dto/delete-entry.dto';

interface MongoError {
  code: number;
}

function isMongoError(error: unknown): error is MongoError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as MongoError).code === 'number'
  );
}

@Injectable()
export class EntriesService {
  constructor(@InjectModel(Entry.name) private entryModel: Model<Entry>) {}

  async create(createEntryDto: CreateEntryDto, userId: string): Promise<Entry> {
    // Validate habitId is a valid ObjectId
    if (!Types.ObjectId.isValid(createEntryDto.habitId)) {
      throw new BadRequestException('Invalid habit ID');
    }

    try {
      const entry = new this.entryModel({
        habitId: new Types.ObjectId(createEntryDto.habitId),
        userId,
        date: createEntryDto.date,
      });

      return await entry.save();
    } catch (error) {
      // Handle duplicate key error (entry already exists)
      if (isMongoError(error) && error.code === 11000) {
        throw new BadRequestException(
          'Entry already exists for this habit and date'
        );
      }
      throw error;
    }
  }

  async remove(deleteEntryDto: DeleteEntryDto, userId: string): Promise<void> {
    // Validate habitId is a valid ObjectId
    if (!Types.ObjectId.isValid(deleteEntryDto.habitId)) {
      throw new BadRequestException('Invalid habit ID');
    }

    const result = await this.entryModel
      .deleteOne({
        habitId: new Types.ObjectId(deleteEntryDto.habitId),
        userId,
        date: deleteEntryDto.date,
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Entry not found');
    }
  }

  async getTodayEntries(userId: string): Promise<string[]> {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    const entries = await this.entryModel
      .find({ userId, date: today })
      .select('habitId')
      .exec();

    return entries.map((entry) => entry.habitId.toString());
  }
}

