import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeveloperProject } from './entities/developer-project.entity';
import {
  CreateDeveloperProjectDto,
  UpdateDeveloperProjectDto,
} from './dto/create-project.dto';

@Injectable()
export class DeveloperProjectsService {
  constructor(
    @InjectRepository(DeveloperProject)
    private readonly repo: Repository<DeveloperProject>,
  ) {}

  async findAllByUserId(userId: string): Promise<DeveloperProject[]> {
    return this.repo.find({
      where: { userId },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<DeveloperProject> {
    const project = await this.repo.findOne({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId) throw new ForbiddenException();
    return project;
  }

  async create(userId: string, dto: CreateDeveloperProjectDto): Promise<DeveloperProject> {
    const count = await this.repo.count({ where: { userId } });
    const project = this.repo.create({
      userId,
      name: dto.name,
      repositoryName: dto.repositoryName ?? null,
      sortOrder: dto.sortOrder ?? count,
    });
    return this.repo.save(project);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateDeveloperProjectDto,
  ): Promise<DeveloperProject> {
    const project = await this.findOne(id, userId);
    if (dto.name !== undefined) project.name = dto.name;
    if (dto.repositoryName !== undefined) project.repositoryName = dto.repositoryName;
    if (dto.sortOrder !== undefined) project.sortOrder = dto.sortOrder;
    return this.repo.save(project);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.repo.delete(id);
  }
}
