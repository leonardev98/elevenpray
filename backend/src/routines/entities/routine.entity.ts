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

export type BlockType = 'heading' | 'list' | 'text';

export interface Block {
  id?: string;
  type: BlockType;
  content: string;
}

/** Items con id estable para drag & drop. Orden = orden del array. */
export interface DayItem {
  id: string;
  type: BlockType;
  content: string;
}

/** Contenedor padre por día: título, horario opcional, ítems hijos. */
export interface DayGroup {
  id: string;
  title: string;
  time?: string;
  items: DayItem[];
}

export interface DayContent {
  /** Legacy */
  blocks?: Block[];
  /** Legacy; si no hay groups, la UI puede usarlo como un solo grupo implícito */
  items?: DayItem[];
  /** Grupos (contenedores) del día; si existe, la UI usa solo groups */
  groups?: DayGroup[];
}

@Entity('routines')
export class Routine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'topic_id', type: 'uuid', nullable: true })
  topicId: string | null;

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

export const DAY_KEYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;
