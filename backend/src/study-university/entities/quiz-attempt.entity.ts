import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type QuizAttemptSource = 'quiz' | 'combined';

export type QuizAttemptAnswer = {
  questionId: string;
  selectedOptionId?: string | null;
  selectedOptionIds?: string[];
  textAnswer?: string | null;
  correct: boolean;
};

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'source_kind', type: 'text', default: 'quiz' })
  sourceKind: QuizAttemptSource;

  @Column({ name: 'source_quiz_ids', type: 'jsonb', nullable: true })
  sourceQuizIds: string[] | null;

  @Column({ name: 'class_session_ids', type: 'jsonb', nullable: true })
  classSessionIds: string[] | null;

  @Column({ name: 'total_questions', type: 'int', default: 0 })
  totalQuestions: number;

  @Column({ name: 'correct_count', type: 'int', default: 0 })
  correctCount: number;

  @Column({ type: 'boolean', default: false })
  passed: boolean;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number | null;

  @Column({ type: 'jsonb', nullable: true })
  answers: QuizAttemptAnswer[] | null;

  @CreateDateColumn({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}
