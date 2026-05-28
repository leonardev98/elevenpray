import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassSession } from '../study-university/entities/class-session.entity';
import { Course } from '../study-university/entities/course.entity';
import { CourseResource } from '../study-university/entities/course-resource.entity';
import { InternalResourcesController } from './internal-resources.controller';
import { InternalResourcesService } from './internal-resources.service';

@Module({
  imports: [TypeOrmModule.forFeature([CourseResource, Course, ClassSession])],
  controllers: [InternalResourcesController],
  providers: [InternalResourcesService],
})
export class InternalResourcesModule {}
