import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('class_sessions')
export class ClassSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @Column({ name: 'semester_id', type: 'uuid', nullable: true })
  semesterId: string | null;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ name: 'schedule_id', type: 'uuid', nullable: true })
  scheduleId: string | null;

  @Column({ name: 'session_date', type: 'date' })
  sessionDate: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ type: 'text', nullable: true })
  classroom: string | null;

  @Column({ type: 'text', nullable: true })
  title: string | null;

  @Column({ name: 'notes_html', type: 'text', nullable: true })
  notesHtml: string | null;

  @Column({ name: 'notes_json', type: 'jsonb', nullable: true })
  notesJson: Record<string, unknown> | null;

  @Column({ name: 'ai_summary_mock', type: 'text', nullable: true })
  aiSummaryMock: string | null;

  @Column({ name: 'generated_from_schedule', type: 'boolean', default: false })
  generatedFromSchedule: boolean;

  @Column({ name: 'opened_at', type: 'timestamptz', nullable: true })
  openedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
