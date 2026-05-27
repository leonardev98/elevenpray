import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_daily_activity')
export class UserDailyActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'activity_date', type: 'date' })
  activityDate: string;

  @Column({ type: 'boolean', default: false })
  study: boolean;

  @Column({ type: 'boolean', default: false })
  tasks: boolean;

  @Column({ type: 'boolean', default: false })
  checkin: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
