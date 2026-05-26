import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { CommunityPost } from './entities/community-post.entity';
import { CommunityPostLike } from './entities/community-post-like.entity';
import { CommunityPostComment } from './entities/community-post-comment.entity';
import { CommunityQuestion } from './entities/community-question.entity';
import { CommunityQuestionAnswer } from './entities/community-question-answer.entity';
import { CommunityAnswerVote } from './entities/community-answer-vote.entity';
import { CommunityReport } from './entities/community-report.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommunityPost,
      CommunityPostLike,
      CommunityPostComment,
      CommunityQuestion,
      CommunityQuestionAnswer,
      CommunityAnswerVote,
      CommunityReport,
      User,
    ]),
    AuthModule,
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
