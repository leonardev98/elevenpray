import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExpertConsultationExpert } from './expert-consultation-expert.entity';

@Entity('expert_consultation_expert_workspace_types')
export class ExpertConsultationExpertWorkspaceType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'expert_id', type: 'uuid' })
  expertId: string;

  @ManyToOne(() => ExpertConsultationExpert, (e) => e.workspaceTypes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expert_id' })
  expert?: ExpertConsultationExpert;

  @Column({ name: 'workspace_type_code', type: 'text' })
  workspaceTypeCode: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
