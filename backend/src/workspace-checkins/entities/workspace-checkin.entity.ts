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

/**
 * Flexible check-in payload. UI can use e.g.:
 * skinFeeling, dryness, oiliness, redness, sensitivity, breakouts, itchiness,
 * confidenceNote, sleepQuality, stress, cycleNote, weatherNote, freeNotes, imageUrl.
 */
export interface CheckinData {
  skinFeeling?: string;
  dryness?: number;
  oiliness?: number;
  redness?: number;
  sensitivity?: number;
  breakouts?: number;
  itchiness?: number;
  confidenceNote?: string;
  sleepQuality?: number;
  stress?: number;
  cycleNote?: string;
  weatherNote?: string;
  freeNotes?: string;
  imageUrl?: string;
  [key: string]: unknown;
}

@Entity('workspace_checkins')
export class WorkspaceCheckin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace?: Workspace;

  @Column({ name: 'checkin_date', type: 'date' })
  checkinDate: string;

  @Column({ type: 'jsonb', nullable: true })
  data: CheckinData | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
