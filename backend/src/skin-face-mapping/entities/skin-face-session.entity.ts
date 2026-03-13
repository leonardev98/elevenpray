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
import { Workspace } from '../../workspaces/entities/workspace.entity';
import { SkinFaceMarker } from './skin-face-marker.entity';

export type FaceModelType = 'female' | 'male';

@Entity('skin_face_sessions')
export class SkinFaceSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace?: Workspace;

  @Column({ name: 'session_date', type: 'date' })
  sessionDate: string;

  @Column({ name: 'face_model_type', type: 'text' })
  faceModelType: FaceModelType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => SkinFaceMarker, (marker) => marker.session)
  markers?: SkinFaceMarker[];
}
