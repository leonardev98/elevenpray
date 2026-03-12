import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { PromptTagsService } from './prompt-tags.service';
import { CreatePromptTagDto, PromptTagQueryDto } from './dto/create-tag.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('prompt-tags')
@UseGuards(JwtAuthGuard)
export class PromptTagsController {
  constructor(private readonly promptTagsService: PromptTagsService) {}

  @Get()
  findAll(@Query() query: PromptTagQueryDto) {
    return this.promptTagsService.findAll(query.search);
  }

  @Post()
  create(@Body() dto: CreatePromptTagDto) {
    return this.promptTagsService.findOrCreateByName(dto.name);
  }
}
