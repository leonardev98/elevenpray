import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CommunityQuestionAnswer } from '../community/entities/community-question-answer.entity';
import { UserXpEvent } from '../community/entities/user-xp-event.entity';
import { QuizAttempt } from '../study-university/entities/quiz-attempt.entity';
import { UserDailyActivity } from './entities/user-daily-activity.entity';
import { StudentActivityController } from './student-activity.controller';
import { StudentActivityService } from './student-activity.service';
import { XpRewardService } from './xp-reward.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserDailyActivity,
      UserXpEvent,
      QuizAttempt,
      CommunityQuestionAnswer,
    ]),
    AuthModule,
  ],
  controllers: [StudentActivityController],
  providers: [StudentActivityService, XpRewardService],
  exports: [StudentActivityService, XpRewardService],
})
export class StudentActivityModule {}
