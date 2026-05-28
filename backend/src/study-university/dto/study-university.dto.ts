import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class UpsertStudyWorkspaceConfigDto {
  @IsOptional()
  @IsString()
  workspaceName?: string;

  @IsOptional()
  @IsString()
  currentSemesterLabel?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIn(['0_20', '0_100', 'A_F'])
  gradeScale?: '0_20' | '0_100' | 'A_F';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  creditGoal?: number;

  @IsOptional()
  @IsBoolean()
  autoGenerateSessions?: boolean;

  @IsOptional()
  @IsBoolean()
  remindersEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  conflictDetectionEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  aiSummaryEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  onboardingCompleted?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(3)
  onboardingStep?: number;
}

export class CreateSemesterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  creditGoal?: number;
}

export class UpdateSemesterDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  isCurrent?: boolean;
}

export class CreateCourseScheduleDto {
  @IsIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
  weekday: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsOptional()
  @IsString()
  classroom?: string;
}

export class CreateCourseDto {
  @IsOptional()
  @IsUUID()
  semesterId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  code?: string;

  @IsOptional()
  @IsString()
  professor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  credits?: number;

  @IsOptional()
  @IsString()
  classroom?: string;

  @IsOptional()
  @IsIn(['lecture', 'lab', 'seminar', 'workshop', 'other'])
  courseType?: 'lecture' | 'lab' | 'seminar' | 'workshop' | 'other';

  @IsIn(['blue', 'violet', 'emerald', 'amber', 'rose', 'cyan', 'indigo', 'teal'])
  colorToken: 'blue' | 'violet' | 'emerald' | 'amber' | 'rose' | 'cyan' | 'indigo' | 'teal';

  @IsOptional()
  @IsString()
  icon?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCourseScheduleDto)
  schedules: CreateCourseScheduleDto[];
}

export class ReorderCoursesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  orderedCourseIds: string[];
}

export class GenerateSessionsDto {
  @IsUUID()
  semesterId: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}

export class CreateClassSessionDto {
  @IsUUID()
  courseId: string;

  @IsOptional()
  @IsUUID()
  semesterId?: string;

  @IsDateString()
  sessionDate: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsOptional()
  @IsString()
  classroom?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  classNumber?: number;

  @IsOptional()
  @IsString()
  unitLabel?: string;
}

export class UpdateClassSessionNotesDto {
  @IsOptional()
  @IsString()
  notesHtml?: string;

  @IsOptional()
  @IsObject()
  notesJson?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  aiSummaryMock?: string;
}

export class UpdateClassSessionDto {
  @IsOptional()
  @IsDateString()
  sessionDate?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  startTime?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  endTime?: string;

  @IsOptional()
  @IsString()
  classroom?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  classNumber?: number;

  @IsOptional()
  @IsString()
  unitLabel?: string;
}

export class CreateAssignmentDto {
  @IsUUID()
  courseId: string;

  @IsOptional()
  @IsUUID()
  semesterId?: string;

  @IsOptional()
  @IsUUID()
  classSessionId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  deadline: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  @IsOptional()
  @IsIn(['pending', 'in_progress', 'submitted', 'done', 'late'])
  status?: 'pending' | 'in_progress' | 'submitted' | 'done' | 'late';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @IsOptional()
  @IsArray()
  attachments?: unknown[];
}

export class UpdateAssignmentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high', 'urgent'])
  priority?: 'low' | 'medium' | 'high' | 'urgent';

  @IsOptional()
  @IsIn(['pending', 'in_progress', 'submitted', 'done', 'late'])
  status?: 'pending' | 'in_progress' | 'submitted' | 'done' | 'late';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @IsOptional()
  @IsUUID()
  classSessionId?: string | null;
}

export class UpdateAssignmentStatusDto {
  @IsIn(['pending', 'in_progress', 'submitted', 'done', 'late'])
  status: 'pending' | 'in_progress' | 'submitted' | 'done' | 'late';
}

export class UpsertAttendanceDto {
  @IsUUID()
  classSessionId: string;

  @IsUUID()
  courseId: string;

  @IsIn(['present', 'late', 'absent', 'justified'])
  status: 'present' | 'late' | 'absent' | 'justified';

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateGradeItemDto {
  @IsUUID()
  courseId: string;

  @IsOptional()
  @IsUUID()
  classSessionId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn(['exam', 'quiz', 'project', 'assignment', 'participation', 'other'])
  type: 'exam' | 'quiz' | 'project' | 'assignment' | 'participation' | 'other';

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  weight: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  score?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.0001)
  maxScore?: number;

  @IsOptional()
  @IsDateString()
  gradeDate?: string;
}

export class CreateFocusSessionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsOptional()
  @IsUUID()
  courseId?: string;
}

export class CompleteFocusSessionDto {
  @IsOptional()
  @IsIn(['completed', 'cancelled'])
  status?: 'completed' | 'cancelled';
}

// === Flashcards =========================================================

export class CreateFlashcardDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  answer: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  hint?: string;

  @IsOptional()
  @IsUUID()
  classSessionId?: string;
}

export class UpdateFlashcardDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  question?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  answer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  hint?: string;

  @IsOptional()
  @IsUUID()
  classSessionId?: string;
}

// === Quizzes ============================================================

export class CreateQuizOptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(8)
  label: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text: string;

  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuizQuestionDto {
  @IsIn(['multiple_choice', 'true_false', 'short_answer'])
  type: 'multiple_choice' | 'true_false' | 'short_answer';

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  prompt: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  explanation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  expectedAnswer?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizOptionDto)
  options?: CreateQuizOptionDto[];
}

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty?: number;

  @IsOptional()
  @IsUUID()
  classSessionId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizQuestionDto)
  questions: CreateQuizQuestionDto[];
}

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  difficulty?: number;

  @IsOptional()
  @IsUUID()
  classSessionId?: string;
}

export class CombinedQuizPreviewDto {
  @IsArray()
  @IsUUID('4', { each: true })
  quizIds: string[];
}

export class QuizAttemptAnswerDto {
  @IsUUID()
  questionId: string;

  @IsOptional()
  @IsUUID()
  selectedOptionId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  selectedOptionIds?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  textAnswer?: string;
}

export class CreateQuizAttemptDto {
  @IsIn(['quiz', 'combined'])
  sourceKind: 'quiz' | 'combined';

  @IsArray()
  @IsUUID('4', { each: true })
  sourceQuizIds: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  classSessionIds?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAttemptAnswerDto)
  answers: QuizAttemptAnswerDto[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  durationSeconds?: number;
}

// === Course notes =======================================================

export class CreateCourseNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @IsOptional()
  @IsObject()
  contentJson?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  preview?: string;

  @IsOptional()
  @IsString()
  colorAccent?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readMinutes?: number;

  @IsOptional()
  @IsUUID()
  classSessionId?: string;
}

export class UpdateCourseNoteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsObject()
  contentJson?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  preview?: string;

  @IsOptional()
  @IsString()
  colorAccent?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readMinutes?: number;

  @IsOptional()
  @IsUUID()
  classSessionId?: string;
}
