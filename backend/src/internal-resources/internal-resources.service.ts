import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassSession } from '../study-university/entities/class-session.entity';
import { Course } from '../study-university/entities/course.entity';
import { CourseResource } from '../study-university/entities/course-resource.entity';
import type { ResourceIngestedDto } from './dto/resource-ingested.dto';

@Injectable()
export class InternalResourcesService {
  constructor(
    @InjectRepository(CourseResource)
    private readonly resourceRepo: Repository<CourseResource>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(ClassSession)
    private readonly sessionRepo: Repository<ClassSession>,
  ) {}

  async handleResourceIngested(dto: ResourceIngestedDto) {
    const course = await this.courseRepo.findOne({ where: { id: dto.course_id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const session = await this.sessionRepo.findOne({
      where: { id: dto.class_id, courseId: dto.course_id },
    });
    if (!session) {
      throw new BadRequestException('class_id does not belong to course_id');
    }

    const title = this.titleFromKeyUrl(dto.key_url);
    const s3Key = this.s3KeyFromKeyUrl(dto.key_url);

    const existing = await this.resourceRepo.findOne({ where: { id: dto.resource_id } });
    if (existing) {
      existing.workspaceId = course.workspaceId;
      existing.courseId = dto.course_id;
      existing.classSessionId = dto.class_id;
      existing.url = dto.key_url;
      existing.title = title;
      existing.kind = 'file';
      existing.metadata = {
        ...(existing.metadata ?? {}),
        s3Key,
        classSessionId: dto.class_id,
        ingestedAt: new Date().toISOString(),
      };
      await this.resourceRepo.save(existing);
      return { id: existing.id, updated: true };
    }

    const row = this.resourceRepo.create({
      id: dto.resource_id,
      workspaceId: course.workspaceId,
      courseId: dto.course_id,
      classSessionId: dto.class_id,
      title,
      kind: 'file',
      url: dto.key_url,
      metadata: {
        s3Key,
        classSessionId: dto.class_id,
        ingestedAt: new Date().toISOString(),
      },
    });
    await this.resourceRepo.save(row);
    return { id: row.id, updated: false };
  }

  private titleFromKeyUrl(keyUrl: string): string {
    try {
      const path = new URL(keyUrl).pathname;
      const base = path.split('/').pop() ?? 'Recurso';
      return decodeURIComponent(base);
    } catch {
      return 'Recurso';
    }
  }

  private s3KeyFromKeyUrl(keyUrl: string): string | null {
    try {
      const url = new URL(keyUrl);
      return url.pathname.replace(/^\//, '');
    } catch {
      return null;
    }
  }
}
