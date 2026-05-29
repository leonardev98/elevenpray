import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { StudentActivityService } from './student-activity.service';
import { RecordActivityDto } from './dto/record-activity.dto';
import { RecordXpDto } from './dto/record-xp.dto';

@Controller('student-activity')
@UseGuards(JwtAuthGuard)
export class StudentActivityController {
  constructor(private readonly service: StudentActivityService) {}

  @Get('summary')
  getSummary(@CurrentUser('id') userId: string) {
    return this.service.getSummary(userId);
  }

  @Post('record')
  record(@CurrentUser('id') userId: string, @Body() dto: RecordActivityDto) {
    return this.service.record(userId, dto);
  }

  @Post('xp')
  recordXp(@CurrentUser('id') userId: string, @Body() dto: RecordXpDto) {
    return this.service.recordXpEvent(userId, dto.amount, dto.source);
  }
}
