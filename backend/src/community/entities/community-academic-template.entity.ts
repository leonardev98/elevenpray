import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export const TEMPLATE_TYPES = [
  'apunte',
  'mapa_mental',
  'esquema',
  'planificador',
  'tabla',
] as const;
export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export const TEMPLATE_CAREERS = [
  'medicina',
  'ingenieria',
  'derecho',
  'administracion',
  'psicologia',
  'sistemas',
  'arquitectura',
  'otras',
] as const;
export type TemplateCareer = (typeof TEMPLATE_CAREERS)[number];

export const TEMPLATE_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type TemplateStatus = (typeof TEMPLATE_STATUSES)[number];

@Entity('community_academic_templates')
export class CommunityAcademicTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  type: TemplateType;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  career: TemplateCareer;

  @Column({ type: 'text' })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  university: string | null;

  @Column({ name: 'attachment_url', type: 'text', nullable: true })
  attachmentUrl: string | null;

  @Column({ name: 'attachment_name', type: 'text', nullable: true })
  attachmentName: string | null;

  @Column({ name: 'attachment_size_bytes', type: 'bigint', nullable: true })
  attachmentSizeBytes: string | null;

  @Column({ name: 'attachment_mime', type: 'text', nullable: true })
  attachmentMime: string | null;

  @Column({ type: 'text', default: 'pending' })
  status: TemplateStatus;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'download_count', type: 'int', default: 0 })
  downloadCount: number;

  @Column({ name: 'save_count', type: 'int', default: 0 })
  saveCount: number;

  @Column({ name: 'authorship_confirmed', type: 'boolean', default: false })
  authorshipConfirmed: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date | null;

  @Column({ name: 'rejected_at', type: 'timestamptz', nullable: true })
  rejectedAt: Date | null;
}
