import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import { StatsService } from './stats.service';

// For simplicity, we're using a hardcoded user ID
const DEMO_USER_ID = 'demo-user-1';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('heatmap')
  async getHeatmap(
    @Query('days', new ParseIntPipe({ optional: true })) days?: number
  ) {
    return this.statsService.getHeatmap(DEMO_USER_ID, days || 60);
  }

  @Get('streaks')
  async getStreaks() {
    return this.statsService.getStreaks(DEMO_USER_ID);
  }
}

