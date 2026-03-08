import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { TopicsService } from './topics.service';
import { CreateTopicDto, UpdateTopicDto } from './dto/create-topic.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { PublicUser } from '../auth/auth.service';
import { RoutinesService } from '../routines/routines.service';

@Controller('topics')
@UseGuards(JwtAuthGuard)
export class TopicsController {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly routinesService: RoutinesService,
  ) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.topicsService.findAllByUserId(userId);
  }

  @Get(':topicId/routines')
  findRoutines(
    @Param('topicId') topicId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.routinesService.findByTopicId(topicId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.topicsService.findOne(id, userId);
  }

  @Post()
  create(@Body() dto: CreateTopicDto, @CurrentUser() user: PublicUser) {
    return this.topicsService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTopicDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.topicsService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.topicsService.remove(id, user.id);
  }
}
