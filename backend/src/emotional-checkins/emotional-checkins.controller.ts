import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EmotionalCheckinsService } from './emotional-checkins.service';
import { UpsertTodayCheckInDto } from './dto/upsert-today-check-in.dto';

@Controller('emotional-checkins')
@UseGuards(JwtAuthGuard)
export class EmotionalCheckinsController {
  constructor(private readonly service: EmotionalCheckinsService) {}

  @Put('today')
  upsertToday(@CurrentUser('id') userId: string, @Body() dto: UpsertTodayCheckInDto) {
    return this.service.upsertToday(userId, dto);
  }

  @Get('today')
  getToday(@CurrentUser('id') userId: string) {
    return this.service.getToday(userId);
  }

  @Get('history')
  getHistory(
    @CurrentUser('id') userId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.service.getHistory(userId, from, to);
  }

  @Get('summary')
  getSummary(@CurrentUser('id') userId: string) {
    return this.service.getSummary(userId);
  }
}
