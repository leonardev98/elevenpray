import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';
import {
  CreateCommentDto,
  UpdateCommentDto,
} from './dto/create-comment.dto';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  AcceptAnswerDto,
} from './dto/create-question.dto';
import {
  CreateAnswerDto,
  UpdateAnswerDto,
} from './dto/create-answer.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { PresignAttachmentDto } from './dto/presign-attachment.dto';

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly service: CommunityService) {}

  // ---------- posts ----------

  @Get('posts')
  listPosts(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('university') university?: string,
    @Query('course') course?: string,
  ) {
    return this.service.listPosts(userId, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      university,
      course,
    });
  }

  @Get('posts/:id')
  getPost(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.getPost(id, userId);
  }

  @Post('posts')
  createPost(@Body() dto: CreatePostDto, @CurrentUser('id') userId: string) {
    return this.service.createPost(userId, dto);
  }

  @Patch('posts/:id')
  updatePost(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.updatePost(id, userId, dto);
  }

  @Delete('posts/:id')
  async deletePost(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.service.deletePost(id, userId);
    return { success: true };
  }

  // ---------- likes ----------

  @Post('posts/:id/like')
  likePost(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.likePost(id, userId);
  }

  @Delete('posts/:id/like')
  unlikePost(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.unlikePost(id, userId);
  }

  // ---------- comments ----------

  @Get('posts/:id/comments')
  listComments(@Param('id') id: string) {
    return this.service.listComments(id);
  }

  @Post('posts/:id/comments')
  createComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.createComment(id, userId, dto);
  }

  @Patch('comments/:id')
  updateComment(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.updateComment(id, userId, dto);
  }

  @Delete('comments/:id')
  async deleteComment(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.service.deleteComment(id, userId);
    return { success: true };
  }

  // ---------- attachments ----------

  @Post('attachments/presign')
  presignAttachment(
    @Body() dto: PresignAttachmentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.presignAttachment(userId, dto.contentType);
  }

  // ---------- questions ----------

  @Get('questions')
  listQuestions(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('university') university?: string,
    @Query('course') course?: string,
    @Query('filter') filter?: string,
  ) {
    return this.service.listQuestions(userId, {
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
      university,
      course,
      filter: filter as 'all' | 'unanswered' | 'top' | 'week' | undefined,
    });
  }

  @Get('questions/:id')
  getQuestion(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.getQuestion(id, userId);
  }

  @Post('questions')
  createQuestion(
    @Body() dto: CreateQuestionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.createQuestion(userId, dto);
  }

  @Patch('questions/:id')
  updateQuestion(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.updateQuestion(id, userId, dto);
  }

  @Delete('questions/:id')
  async deleteQuestion(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.service.deleteQuestion(id, userId);
    return { success: true };
  }

  // ---------- answers ----------

  @Post('questions/:id/answers')
  createAnswer(
    @Param('id') id: string,
    @Body() dto: CreateAnswerDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.createAnswer(id, userId, dto);
  }

  @Patch('answers/:id')
  updateAnswer(
    @Param('id') id: string,
    @Body() dto: UpdateAnswerDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.updateAnswer(id, userId, dto);
  }

  @Delete('answers/:id')
  async deleteAnswer(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.service.deleteAnswer(id, userId);
    return { success: true };
  }

  @Post('answers/:id/vote')
  voteAnswer(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.voteAnswer(id, userId);
  }

  @Delete('answers/:id/vote')
  unvoteAnswer(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.unvoteAnswer(id, userId);
  }

  @Post('questions/:id/accept-answer')
  acceptAnswer(
    @Param('id') id: string,
    @Body() dto: AcceptAnswerDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.acceptAnswer(id, dto.answerId, userId);
  }

  // ---------- reports ----------

  @Post('reports')
  createReport(
    @Body() dto: CreateReportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.createReport(userId, dto);
  }
}
