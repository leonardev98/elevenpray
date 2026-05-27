import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('curriculum_prerequisites')
export class CurriculumPrerequisite {
  @PrimaryColumn({ name: 'curriculum_course_id', type: 'uuid' })
  curriculumCourseId: string;

  @PrimaryColumn({ name: 'prerequisite_course_id', type: 'uuid' })
  prerequisiteCourseId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
