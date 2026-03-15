import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { UniversityGradeScale } from '../study-university.types';

@Entity('study_workspace_configs')
export class StudyWorkspaceConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id', type: 'uuid', unique: true })
  workspaceId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'subtype_code', type: 'text', default: 'university' })
  subtypeCode: string;

  @Column({ name: 'current_semester_label', type: 'text', nullable: true })
  currentSemesterLabel: string | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string | null;

  @Column({
    name: 'grade_scale',
    type: 'enum',
    enum: ['0_20', '0_100', 'A_F'],
    enumName: 'university_grade_scale',
    default: '0_100',
  })
  gradeScale: UniversityGradeScale;

  @Column({ name: 'credit_goal', type: 'numeric', precision: 6, scale: 2, nullable: true })
  creditGoal: string | null;

  @Column({ name: 'auto_generate_sessions', type: 'boolean', default: true })
  autoGenerateSessions: boolean;

  @Column({ name: 'reminders_enabled', type: 'boolean', default: true })
  remindersEnabled: boolean;

  @Column({ name: 'conflict_detection_enabled', type: 'boolean', default: true })
  conflictDetectionEnabled: boolean;

  @Column({ name: 'ai_summary_enabled', type: 'boolean', default: true })
  aiSummaryEnabled: boolean;

  @Column({ name: 'onboarding_completed', type: 'boolean', default: false })
  onboardingCompleted: boolean;

  @Column({ name: 'onboarding_step', type: 'int', default: 1 })
  onboardingStep: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
