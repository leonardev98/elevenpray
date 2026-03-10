import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExpertConsultationSession } from './expert-consultation-session.entity';

/** Optional metadata: type (routine_review | progress_feedback), payload, attachments */
export interface ExpertConsultationMessageMeta {
  type?: 'routine_review' | 'progress_feedback' | string;
  payload?: Record<string, unknown>;
  attachments?: Array<{ url: string; name?: string }>;
  [key: string]: unknown;
}

@Entity('expert_consultation_messages')
export class ExpertConsultationMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'session_id', type: 'uuid' })
  sessionId: string;

  @ManyToOne(() => ExpertConsultationSession, (s) => s.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session?: ExpertConsultationSession;

  @Column({ name: 'sender_type', type: 'text' })
  senderType: 'user' | 'expert';

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: ExpertConsultationMessageMeta | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
