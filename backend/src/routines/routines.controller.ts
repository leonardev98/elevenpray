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
import { RoutinesService } from './routines.service';
import { CreateRoutineDto, UpdateRoutineDto } from './dto/create-routine.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { PublicUser } from '../auth/auth.service';

@Controller('routines')
@UseGuards(JwtAuthGuard)
export class RoutinesController {
  constructor(private readonly routinesService: RoutinesService) {}

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query('topicId') topicId?: string,
  ) {
    if (topicId) return this.routinesService.findByTopicId(topicId, userId);
    return this.routinesService.findAllByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.routinesService.findOne(id, userId);
  }

  @Post()
  create(@Body() dto: CreateRoutineDto, @CurrentUser() user: PublicUser) {
    return this.routinesService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRoutineDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.routinesService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.routinesService.remove(id, user.id);
  }
}
