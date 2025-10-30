import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { Habit } from '../schemas/habit.schema';

// For simplicity, we're using a hardcoded user ID
// In production, you would get this from JWT token/authentication
const DEMO_USER_ID = 'demo-user-1';

@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createHabitDto: CreateHabitDto): Promise<Habit> {
    return this.habitsService.create(createHabitDto, DEMO_USER_ID);
  }

  @Get()
  async findAll(): Promise<Habit[]> {
    return this.habitsService.findAll(DEMO_USER_ID);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.habitsService.remove(id, DEMO_USER_ID);
    return { message: 'Habit deleted successfully' };
  }
}

