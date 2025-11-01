import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { EntriesService } from './entries.service';
import { CreateEntryDto } from '../dto/create-entry.dto';
import { DeleteEntryDto } from '../dto/delete-entry.dto';
import { Entry } from '../schemas/entry.schema';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import type { AuthUser } from '../auth/user.decorator';

@Controller('entries')
@UseGuards(FirebaseAuthGuard)
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(
    @Body() createEntryDto: CreateEntryDto,
    @User() user: AuthUser
  ): Promise<Entry> {
    return this.entriesService.create(createEntryDto, user.uid);
  }

  @Delete()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async remove(
    @Body() deleteEntryDto: DeleteEntryDto,
    @User() user: AuthUser
  ): Promise<{ message: string }> {
    await this.entriesService.remove(deleteEntryDto, user.uid);
    return { message: 'Entry deleted successfully' };
  }

  @Get('today')
  async getTodayEntries(@User() user: AuthUser): Promise<string[]> {
    return this.entriesService.getTodayEntries(user.uid);
  }
}

