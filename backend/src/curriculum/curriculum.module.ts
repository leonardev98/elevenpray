import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { Course } from '../study-university/entities/course.entity';
import { Semester } from '../study-university/entities/semester.entity';
import { StudyWorkspaceConfig } from '../study-university/entities/study-workspace-config.entity';
import { CurriculumController } from './curriculum.controller';
import { CurriculumService } from './curriculum.service';
import { CurriculumCourse } from './entities/curriculum-course.entity';
import { CurriculumPrerequisite } from './entities/curriculum-prerequisite.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CurriculumCourse,
      CurriculumPrerequisite,
      Course,
      Semester,
      StudyWorkspaceConfig,
    ]),
    AuthModule,
    WorkspacesModule,
  ],
  controllers: [CurriculumController],
  providers: [CurriculumService],
  exports: [CurriculumService],
})
export class CurriculumModule {}
