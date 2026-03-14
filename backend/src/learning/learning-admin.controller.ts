import {
  Controller,
  Post,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { PublicUser } from '../auth/auth.service';
import { LearningService } from './learning.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateVideoDto } from './dto/create-video.dto';

@Controller('admin/learning')
@UseGuards(JwtAuthGuard)
export class LearningAdminController {
  constructor(private readonly learningService: LearningService) {}

  private ensureAdmin(user: PublicUser): void {
    if (user.role !== 'platform_admin') {
      throw new ForbiddenException('Admin role required');
    }
  }

  @Post('articles')
  createArticle(
    @CurrentUser() user: PublicUser,
    @Body() dto: CreateArticleDto,
  ) {
    this.ensureAdmin(user);
    return this.learningService.createArticle(dto);
  }

  @Post('videos')
  createVideo(@CurrentUser() user: PublicUser, @Body() dto: CreateVideoDto) {
    this.ensureAdmin(user);
    return this.learningService.createVideo(dto);
  }
}
