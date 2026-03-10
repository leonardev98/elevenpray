import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workspace } from '../../workspaces/entities/workspace.entity';

export type PhotoAngle = 'front' | 'left' | 'right';

@Entity('workspace_photos')
export class WorkspacePhoto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace?: Workspace;

  @Column({ name: 'photo_date', type: 'date' })
  photoDate: string;

  @Column({ type: 'text' })
  angle: PhotoAngle;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'concern_tags', type: 'jsonb', nullable: true })
  concernTags: string[] | null;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
