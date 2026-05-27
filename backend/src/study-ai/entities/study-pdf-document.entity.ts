import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('study_pdf_documents')
export class StudyPdfDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @Column({ name: 'fileingest_document_id', type: 'uuid' })
  fileingestDocumentId: string;

  @Column({ type: 'text' })
  filename: string;

  @Column({ name: 's3_key', type: 'text' })
  s3Key: string;

  @Column({ type: 'text', default: 'pending' })
  status: string;

  @Column({ name: 'summary_text', type: 'text', nullable: true })
  summaryText: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
