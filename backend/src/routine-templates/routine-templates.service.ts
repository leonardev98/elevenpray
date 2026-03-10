import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoutineTemplate } from './entities/routine-template.entity';
import type { DayContent } from './entities/routine-template.entity';
import { CreateRoutineTemplateDto } from './dto/create-routine-template.dto';
import { UpdateRoutineTemplateDto } from './dto/create-routine-template.dto';
import { DAY_KEYS } from './entities/routine-template.entity';

function emptyTemplateDays(): Record<string, DayContent> {
  const days: Record<string, DayContent> = {};
  for (const key of DAY_KEYS) {
    days[key] = { groups: [] };
  }
  return days;
}

@Injectable()
export class RoutineTemplatesService {
  constructor(
    @InjectRepository(RoutineTemplate)
    private readonly repo: Repository<RoutineTemplate>,
  ) {}

  async findAllByUserId(userId: string): Promise<RoutineTemplate[]> {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByWorkspaceId(workspaceId: string, userId: string): Promise<RoutineTemplate[]> {
    return this.repo.find({
      where: { workspaceId, userId },
      order: { year: 'DESC', weekNumber: 'DESC' },
    });
  }

  async findTemplateByWorkspaceId(
    workspaceId: string,
    userId: string,
  ): Promise<RoutineTemplate | null> {
    return this.repo.findOne({
      where: { workspaceId, userId, year: 0, weekNumber: 0 },
    });
  }

  async createTemplateForWorkspace(
    userId: string,
    workspaceId: string,
    workspaceName: string,
  ): Promise<RoutineTemplate> {
    const template = this.repo.create({
      userId,
      workspaceId,
      weekLabel: workspaceName,
      year: 0,
      weekNumber: 0,
      days: emptyTemplateDays(),
    });
    return this.repo.save(template);
  }

  async findOne(id: string, userId: string): Promise<RoutineTemplate> {
    const template = await this.repo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Routine template not found');
    if (template.userId !== userId) throw new ForbiddenException();
    return template;
  }

  async findOneByWorkspaceAndWeek(
    workspaceId: string,
    userId: string,
    year: number,
    weekNumber: number,
  ): Promise<RoutineTemplate | null> {
    return this.repo.findOne({
      where: { workspaceId, userId, year, weekNumber },
    });
  }

  async create(userId: string, dto: CreateRoutineTemplateDto): Promise<RoutineTemplate> {
    const workspaceId = dto.workspaceId ?? null;
    if (!workspaceId) throw new NotFoundException('workspaceId required');
    const template = this.repo.create({
      userId,
      workspaceId,
      weekLabel: dto.weekLabel,
      year: dto.year,
      weekNumber: dto.weekNumber,
      days: (dto.days ?? {}) as Record<string, DayContent>,
      metadata: (dto.metadata ?? null) as RoutineTemplate['metadata'],
    });
    return this.repo.save(template);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateRoutineTemplateDto,
  ): Promise<RoutineTemplate> {
    const template = await this.findOne(id, userId);
    if (dto.weekLabel !== undefined) template.weekLabel = dto.weekLabel;
    if (dto.year !== undefined) template.year = dto.year;
    if (dto.weekNumber !== undefined) template.weekNumber = dto.weekNumber;
    if (dto.days !== undefined) template.days = dto.days as Record<string, DayContent>;
    if (dto.metadata !== undefined)
      template.metadata = dto.metadata as RoutineTemplate['metadata'];
    return this.repo.save(template);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.repo.delete(id);
  }
}
