import { Controller, Get, UseGuards } from '@nestjs/common';
import { PromptCategoriesService } from './prompt-categories.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('prompt-categories')
@UseGuards(JwtAuthGuard)
export class PromptCategoriesController {
  constructor(
    private readonly promptCategoriesService: PromptCategoriesService,
  ) {}

  @Get()
  findAll() {
    return this.promptCategoriesService.findAll();
  }
}
