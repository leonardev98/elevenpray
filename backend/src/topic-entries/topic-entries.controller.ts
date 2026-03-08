import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TopicEntriesService } from './topic-entries.service';
import {
  CreateTopicEntryDto,
  UpdateTopicEntryDto,
} from './dto/create-topic-entry.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { PublicUser } from '../auth/auth.service';

@Controller('topics')
@UseGuards(JwtAuthGuard)
export class TopicEntriesController {
  constructor(private readonly topicEntriesService: TopicEntriesService) {}

  @Get(':topicId/entries')
  findByTopic(
    @Param('topicId') topicId: string,
    @CurrentUser('id') userId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    if (!from || !to) {
      const now = new Date();
      const start = new Date(now);
      start.setDate(1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      from = start.toISOString().slice(0, 10);
      to = end.toISOString().slice(0, 10);
    }
    return this.topicEntriesService.findByTopicAndRange(
      topicId,
      userId,
      from,
      to,
    );
  }

  @Post(':topicId/entries')
  create(
    @Param('topicId') topicId: string,
    @Body() dto: CreateTopicEntryDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.topicEntriesService.create(topicId, user.id, dto);
  }

  @Patch('entries/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTopicEntryDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.topicEntriesService.update(id, user.id, dto);
  }

  @Delete('entries/:id')
  remove(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.topicEntriesService.remove(id, user.id);
  }
}
