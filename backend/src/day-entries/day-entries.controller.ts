import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateDayEntryDto } from './dto/create-day-entry.dto';
import { DayEntriesQueryDto } from './dto/day-entries-query.dto';
import { DayEntriesService } from './day-entries.service';

@Controller('day-entries')
@UseGuards(JwtAuthGuard)
export class DayEntriesController {
  constructor(private readonly service: DayEntriesService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateDayEntryDto) {
    return this.service.create(userId, dto);
  }

  @Get()
  listByDate(@CurrentUser('id') userId: string, @Query() query: DayEntriesQueryDto) {
    return this.service.listByDate(userId, query);
  }

  @Get('dates-with-entries')
  listDatesWithEntries(@CurrentUser('id') userId: string, @Query() query: DayEntriesQueryDto) {
    return this.service.listDatesWithEntries(userId, query);
  }

  @Delete(':id')
  async remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.service.remove(userId, id);
    return { ok: true };
  }
}
