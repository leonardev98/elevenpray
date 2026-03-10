import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Workspace } from '../../workspaces/entities/workspace.entity';

export type BlockType = 'heading' | 'list' | 'text';

export interface DayItem {
  id: string;
  type: BlockType;
  content: string;
  /** Optional product reference (e.g. workspace product id). Used when workspace has product vault. */
  productId?: string;
  /** Optional step type for display (e.g. cleanser, moisturizer). */
  stepType?: string;
}

export type RoutineSlot = 'am' | 'pm';

export interface DayGroup {
  id: string;
  title: string;
  time?: string;
  /** Optional slot for AM/PM grouping (e.g. skincare routines). */
  slot?: RoutineSlot;
  items: DayItem[];
}

export interface DayContent {
  blocks?: { id?: string; type: BlockType; content: string }[];
  items?: DayItem[];
  groups?: DayGroup[];
}

export const DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

@Entity('routine_templates')
export class RoutineTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace?: Workspace;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'week_label', type: 'text' })
  weekLabel: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ name: 'week_number', type: 'int' })
  weekNumber: number;

  @Column({ type: 'jsonb', default: {} })
  days: Record<string, DayContent>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
