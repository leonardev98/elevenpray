import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { CommunityTemplatesController } from './community-templates.controller';
import { CommunityTemplatesService } from './community-templates.service';
import { CommunityPost } from './entities/community-post.entity';
import { CommunityPostLike } from './entities/community-post-like.entity';
import { CommunityPostComment } from './entities/community-post-comment.entity';
import { CommunityQuestion } from './entities/community-question.entity';
import { CommunityQuestionAnswer } from './entities/community-question-answer.entity';
import { CommunityAnswerVote } from './entities/community-answer-vote.entity';
import { CommunityReport } from './entities/community-report.entity';
import { CommunityAcademicTemplate } from './entities/community-academic-template.entity';
import { CommunityTemplateSave } from './entities/community-template-save.entity';
import { UserXpEvent } from './entities/user-xp-event.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { S3Module } from '../s3/s3.module';

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
      CommunityAcademicTemplate,
      CommunityTemplateSave,
      UserXpEvent,
      User,
    ]),
    AuthModule,
    S3Module,
  ],
  controllers: [CommunityController, CommunityTemplatesController],
  providers: [CommunityService, CommunityTemplatesService],
  exports: [CommunityService, CommunityTemplatesService],
})
export class CommunityModule {}
