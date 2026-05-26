import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('course_notes')
export class CourseNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ name: 'class_session_id', type: 'uuid', nullable: true })
  classSessionId: string | null;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ name: 'content_json', type: 'jsonb', nullable: true })
  contentJson: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  preview: string | null;

  @Column({ name: 'color_accent', type: 'text', nullable: true })
  colorAccent: string | null;

  @Column({ type: 'text', default: 'book' })
  icon: string;

  @Column({ name: 'read_minutes', type: 'int', default: 1 })
  readMinutes: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
