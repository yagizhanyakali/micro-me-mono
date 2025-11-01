import {
  Controller,
  Get,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { User } from '../auth/user.decorator';
import type { AuthUser } from '../auth/user.decorator';

@Controller('stats')
@UseGuards(FirebaseAuthGuard)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('heatmap')
  async getHeatmap(
    @User() user: AuthUser,
    @Query('days', new ParseIntPipe({ optional: true })) days?: number
  ) {
    return this.statsService.getHeatmap(user.uid, days || 60);
  }

  @Get('streaks')
  async getStreaks(@User() user: AuthUser) {
    return this.statsService.getStreaks(user.uid);
  }
}

