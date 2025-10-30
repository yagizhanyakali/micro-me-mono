import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EntriesService } from './entries.service';
import { CreateEntryDto } from '../dto/create-entry.dto';
import { DeleteEntryDto } from '../dto/delete-entry.dto';
import { Entry } from '../schemas/entry.schema';

// For simplicity, we're using a hardcoded user ID
const DEMO_USER_ID = 'demo-user-1';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createEntryDto: CreateEntryDto): Promise<Entry> {
    return this.entriesService.create(createEntryDto, DEMO_USER_ID);
  }

  @Delete()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async remove(
    @Body() deleteEntryDto: DeleteEntryDto
  ): Promise<{ message: string }> {
    await this.entriesService.remove(deleteEntryDto, DEMO_USER_ID);
    return { message: 'Entry deleted successfully' };
  }

  @Get('today')
  async getTodayEntries(): Promise<string[]> {
    return this.entriesService.getTodayEntries(DEMO_USER_ID);
  }
}

