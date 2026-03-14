import { Controller, Get, Query } from '@nestjs/common';
import { LearningService } from './learning.service';

@Controller('learning')
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  @Get('articles')
  getArticles(
    @Query('language') language?: string,
    @Query('featured') featured?: string,
  ) {
    const featuredBool = featured === 'true' || featured === '1';
    return this.learningService.findArticles(language, featuredBool);
  }

  @Get('videos')
  getVideos(@Query('language') language?: string) {
    return this.learningService.findVideos(language);
  }
}
