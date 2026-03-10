import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExpertConsultationExpert } from './expert-consultation-expert.entity';
import { ExpertConsultationSpecialty } from './expert-consultation-specialty.entity';

@Entity('expert_consultation_expert_specialties')
export class ExpertConsultationExpertSpecialty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'expert_id', type: 'uuid' })
  expertId: string;

  @ManyToOne(() => ExpertConsultationExpert, (e) => e.specialties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expert_id' })
  expert?: ExpertConsultationExpert;

  @Column({ name: 'specialty_id', type: 'uuid' })
  specialtyId: string;

  @ManyToOne(() => ExpertConsultationSpecialty, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'specialty_id' })
  specialty?: ExpertConsultationSpecialty;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
