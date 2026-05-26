import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export const COMMUNITY_REPORT_TARGET_TYPES = [
  'post',
  'question',
  'answer',
  'comment',
] as const;
export type CommunityReportTargetType =
  (typeof COMMUNITY_REPORT_TARGET_TYPES)[number];

@Entity('community_reports')
export class CommunityReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'target_type', type: 'text' })
  targetType: CommunityReportTargetType;

  @Column({ name: 'target_id', type: 'uuid' })
  targetId: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
