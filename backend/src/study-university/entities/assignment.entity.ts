import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type {
  UniversityAssignmentPriority,
  UniversityAssignmentStatus,
} from '../study-university.types';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @Column({ name: 'semester_id', type: 'uuid', nullable: true })
  semesterId: string | null;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ name: 'class_session_id', type: 'uuid', nullable: true })
  classSessionId: string | null;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'timestamptz' })
  deadline: Date;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority: UniversityAssignmentPriority;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'submitted', 'done', 'late'],
    default: 'pending',
  })
  status: UniversityAssignmentStatus;

  @Column({ type: 'jsonb', nullable: true })
  attachments: unknown[] | null;

  @Column({ name: 'source_kind', type: 'text', default: 'assignment' })
  sourceKind: string;

  @Column({ name: 'external_ref', type: 'text', nullable: true })
  externalRef: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
