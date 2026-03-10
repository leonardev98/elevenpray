import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';
import { ExpertConsultationExpert } from './expert-consultation-expert.entity';
import { ExpertConsultationMessage } from './expert-consultation-message.entity';

@Entity('expert_consultation_sessions')
export class ExpertConsultationSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace?: Workspace;

  @Column({ name: 'expert_id', type: 'uuid' })
  expertId: string;

  @ManyToOne(() => ExpertConsultationExpert, (e) => e.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expert_id' })
  expert?: ExpertConsultationExpert;

  @Column({ type: 'text', default: 'open' })
  status: 'open' | 'closed';

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => ExpertConsultationMessage, (m) => m.session)
  messages?: ExpertConsultationMessage[];
}
