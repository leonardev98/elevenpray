import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { UniversityCourseColorToken, UniversityCourseType } from '../study-university.types';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @Column({ name: 'semester_id', type: 'uuid', nullable: true })
  semesterId: string | null;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  professor: string | null;

  @Column({ type: 'numeric', precision: 6, scale: 2, nullable: true })
  credits: string | null;

  @Column({ type: 'text', nullable: true })
  classroom: string | null;

  @Column({
    name: 'course_type',
    type: 'enum',
    enum: ['lecture', 'lab', 'seminar', 'workshop', 'other'],
    enumName: 'university_course_kind',
    default: 'lecture',
  })
  courseType: UniversityCourseType;

  @Column({
    name: 'color_token',
    type: 'enum',
    enum: ['blue', 'violet', 'emerald', 'amber', 'rose', 'cyan', 'indigo', 'teal'],
    enumName: 'university_course_color_token',
  })
  colorToken: UniversityCourseColorToken;

  @Column({ type: 'text', nullable: true })
  icon: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'boolean', default: false })
  archived: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
