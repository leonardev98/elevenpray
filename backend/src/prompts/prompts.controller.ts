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
import { PromptsService } from './prompts.service';
import { CreatePromptDto, UpdatePromptDto } from './dto/create-prompt.dto';
import { ListPromptsQueryDto } from './dto/list-prompts-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { PublicUser } from '../auth/auth.service';

@Controller('prompts')
@UseGuards(JwtAuthGuard)
export class PromptsController {
  constructor(private readonly promptsService: PromptsService) {}

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query() query: ListPromptsQueryDto,
  ) {
    return this.promptsService.findAll(userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.promptsService.findOne(id, userId);
  }

  @Post()
  create(@Body() dto: CreatePromptDto, @CurrentUser() user: PublicUser) {
    return this.promptsService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePromptDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.promptsService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.promptsService.remove(id, user.id);
  }

  @Post(':id/duplicate')
  duplicate(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.promptsService.duplicate(id, user.id);
  }

  @Patch(':id/favorite')
  setFavorite(
    @Param('id') id: string,
    @Body('value') value: boolean,
    @CurrentUser() user: PublicUser,
  ) {
    return this.promptsService.setFavorite(id, user.id, value === true);
  }

  @Patch(':id/pin')
  setPinned(
    @Param('id') id: string,
    @Body('value') value: boolean,
    @CurrentUser() user: PublicUser,
  ) {
    return this.promptsService.setPinned(id, user.id, value === true);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.promptsService.archive(id, user.id);
  }

  @Patch(':id/unarchive')
  unarchive(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.promptsService.unarchive(id, user.id);
  }

  @Post(':id/use')
  recordUse(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.promptsService.recordUse(id, user.id);
  }
}
