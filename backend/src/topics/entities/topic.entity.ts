import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export const TOPIC_TYPES = [
  'rutina',
  'notas',
  'lista',
  'meta',
  'curso',
  'otro',
] as const;

export type TopicType = (typeof TOPIC_TYPES)[number];

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text' })
  type: TopicType;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
