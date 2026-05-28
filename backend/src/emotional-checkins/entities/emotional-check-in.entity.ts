import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type EmotionalMoodId = 'excellent' | 'good' | 'normal' | 'low' | 'bad';

@Entity('emotional_check_ins')
export class EmotionalCheckIn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'check_in_date', type: 'date' })
  checkInDate: string;

  @Column({ type: 'varchar', length: 20 })
  mood: EmotionalMoodId;

  @Column({ type: 'jsonb', default: [] })
  factors: string[];

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
