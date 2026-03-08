import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DashboardWeekQueryDto } from './dto/dashboard-query.dto';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('week')
  getWeek(
    @CurrentUser('id') userId: string,
    @Query('year') year: string,
    @Query('week') week: string,
  ) {
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    const w = week ? parseInt(week, 10) : getCurrentWeekNumber();
    return this.dashboardService.getWeek(userId, y, w);
  }

  @Post('week/query')
  getWeekQuery(
    @CurrentUser('id') userId: string,
    @Body() dto: DashboardWeekQueryDto,
  ) {
    const year = dto.year ?? new Date().getFullYear();
    const week = dto.week ?? getCurrentWeekNumber();
    return this.dashboardService.getWeekQuery(
      userId,
      year,
      week,
      dto.scope,
      dto.workspaceIds,
    );
  }
}

function getCurrentWeekNumber(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + start.getDay() + 1) / 7);
}
