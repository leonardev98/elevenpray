import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type QuizQuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'quiz_id', type: 'uuid' })
  quizId: string;

  @Column({ type: 'text', default: 'multiple_choice' })
  type: QuizQuestionType;

  @Column({ type: 'text' })
  prompt: string;

  @Column({ type: 'text', nullable: true })
  explanation: string | null;

  @Column({ name: 'expected_answer', type: 'text', nullable: true })
  expectedAnswer: string | null;

  @Column({ type: 'int', default: 0 })
  position: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
