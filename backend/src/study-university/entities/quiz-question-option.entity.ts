import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('quiz_question_options')
export class QuizQuestionOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'question_id', type: 'uuid' })
  questionId: string;

  @Column({ type: 'text' })
  label: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ name: 'is_correct', type: 'boolean', default: false })
  isCorrect: boolean;

  @Column({ type: 'int', default: 0 })
  position: number;
}
