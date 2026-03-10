import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ExpertConsultationExpertWorkspaceType } from './expert-consultation-expert-workspace-type.entity';
import { ExpertConsultationExpertSpecialty } from './expert-consultation-expert-specialty.entity';
import { ExpertConsultationSession } from './expert-consultation-session.entity';

@Entity('expert_consultation_experts')
export class ExpertConsultationExpert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  title: string | null;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => ExpertConsultationExpertWorkspaceType, (ewt) => ewt.expert)
  workspaceTypes?: ExpertConsultationExpertWorkspaceType[];

  @OneToMany(() => ExpertConsultationExpertSpecialty, (es) => es.expert)
  specialties?: ExpertConsultationExpertSpecialty[];

  @OneToMany(() => ExpertConsultationSession, (s) => s.expert)
  sessions?: ExpertConsultationSession[];
}
