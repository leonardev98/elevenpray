import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { StudentActivityModule } from '../student-activity/student-activity.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { Assignment } from './entities/assignment.entity';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { ClassSession } from './entities/class-session.entity';
import { CourseNote } from './entities/course-note.entity';
import { CourseResource } from './entities/course-resource.entity';
import { CourseSchedule } from './entities/course-schedule.entity';
import { Course } from './entities/course.entity';
import { FlashcardDeck } from './entities/flashcard-deck.entity';
import { Flashcard } from './entities/flashcard.entity';
import { GradeItem } from './entities/grade-item.entity';
import { Quiz } from './entities/quiz.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizQuestion } from './entities/quiz-question.entity';
import { QuizQuestionOption } from './entities/quiz-question-option.entity';
import { Reminder } from './entities/reminder.entity';
import { Semester } from './entities/semester.entity';
import { StudyFocusSession } from './entities/study-focus-session.entity';
import { StudyWorkspaceConfig } from './entities/study-workspace-config.entity';
import { FileingestClient } from '../study-ai/fileingest.client';
import { StudyUniversityController } from './study-university.controller';
import { StudyUniversityService } from './study-university.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudyWorkspaceConfig,
      Semester,
      Course,
      CourseSchedule,
      ClassSession,
      Assignment,
      AttendanceRecord,
      GradeItem,
      CourseResource,
      FlashcardDeck,
      Flashcard,
      Quiz,
      QuizQuestion,
      QuizQuestionOption,
      QuizAttempt,
      CourseNote,
      StudyFocusSession,
      Reminder,
    ]),
    AuthModule,
    WorkspacesModule,
    StudentActivityModule,
  ],
  controllers: [StudyUniversityController],
  providers: [StudyUniversityService, FileingestClient],
  exports: [StudyUniversityService],
})
export class StudyUniversityModule {}
