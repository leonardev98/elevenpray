import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { UniversityGradeItemType } from '../study-university.types';

@Entity('grade_items')
export class GradeItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ name: 'class_session_id', type: 'uuid', nullable: true })
  classSessionId: string | null;

  @Column({ type: 'text' })
  name: string;

  @Column({
    type: 'enum',
    enum: ['exam', 'quiz', 'project', 'assignment', 'participation', 'other'],
    default: 'other',
  })
  type: UniversityGradeItemType;

  @Column({ type: 'numeric', precision: 6, scale: 2, default: 0 })
  weight: string;

  @Column({ type: 'numeric', precision: 10, scale: 4, nullable: true })
  score: string | null;

  @Column({ name: 'max_score', type: 'numeric', precision: 10, scale: 4, nullable: true })
  maxScore: string | null;

  @Column({ name: 'grade_date', type: 'date', nullable: true })
  gradeDate: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
