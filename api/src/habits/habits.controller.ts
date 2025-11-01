import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { Habit } from '../schemas/habit.schema';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import type { AuthUser } from '../auth/user.decorator';

@Controller('habits')
@UseGuards(FirebaseAuthGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Body() createHabitDto: CreateHabitDto,
    @User() user: AuthUser
  ): Promise<Habit> {
    return this.habitsService.create(createHabitDto, user.uid);
  }

  @Get()
  async findAll(@User() user: AuthUser): Promise<Habit[]> {
    return this.habitsService.findAll(user.uid);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @User() user: AuthUser
  ): Promise<{ message: string }> {
    await this.habitsService.remove(id, user.uid);
    return { message: 'Habit deleted successfully' };
  }
}

