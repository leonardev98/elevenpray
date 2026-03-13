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
import { SkinFaceSession } from './skin-face-session.entity';

@Entity('skin_face_markers')
export class SkinFaceMarker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace?: Workspace;

  @Column({ name: 'session_id', type: 'uuid', nullable: true })
  sessionId: string | null;

  @ManyToOne(() => SkinFaceSession, (session) => session.markers, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'session_id' })
  session?: SkinFaceSession | null;

  @Column({ name: 'face_model_type', type: 'text' })
  faceModelType: 'female' | 'male';

  @Column({ name: 'issue_type', type: 'text' })
  issueType: string;

  @Column({ type: 'text' })
  severity: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'float' })
  x: number;

  @Column({ type: 'float' })
  y: number;

  @Column({ type: 'float' })
  z: number;

  @Column({ name: 'region_label', type: 'text', nullable: true })
  regionLabel: string | null;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
