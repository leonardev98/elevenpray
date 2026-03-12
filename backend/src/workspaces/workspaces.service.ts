import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/create-workspace.dto';
import { RoutineTemplatesService } from '../routine-templates/routine-templates.service';
import { WorkspaceSubtypesService } from '../workspace-subtypes/workspace-subtypes.service';
import { hasRoutineCapability, getWorkspaceType } from '../workspace-types/workspace-type.registry';
import { Page } from '../pages/entities/page.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    private readonly routineTemplatesService: RoutineTemplatesService,
    private readonly workspaceSubtypesService: WorkspaceSubtypesService,
  ) {}

  async findAllByUserId(userId: string): Promise<Workspace[]> {
    return this.workspaceRepository.find({
      where: { userId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
      relations: ['workspaceSubtype'],
    });
  }

  async findOne(id: string, userId: string): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      relations: ['workspaceSubtype'],
    });
    if (!workspace) throw new NotFoundException('Workspace not found');
    if (workspace.userId !== userId) throw new ForbiddenException();
    return workspace;
  }

  private async deriveWorkspaceName(dto: CreateWorkspaceDto): Promise<string> {
    const trimmed = dto.name?.trim();
    if (trimmed) return trimmed;
    const typeDef = getWorkspaceType(dto.workspaceType);
    const typeLabel = typeDef?.label ?? dto.workspaceType;
    if (!dto.workspaceSubtypeId) return typeLabel;
    const subtype = await this.workspaceSubtypesService.findOne(dto.workspaceSubtypeId);
    const subtypeLabel = subtype?.label;
    return subtypeLabel ? `${typeLabel} – ${subtypeLabel}` : typeLabel;
  }

  async create(userId: string, dto: CreateWorkspaceDto): Promise<Workspace> {
    const count = await this.workspaceRepository.count({ where: { userId } });
    const name = await this.deriveWorkspaceName(dto);
    const workspace = this.workspaceRepository.create({
      userId,
      name,
      workspaceType: dto.workspaceType as Workspace['workspaceType'],
      workspaceSubtypeId: dto.workspaceSubtypeId ?? null,
      sortOrder: count,
    });
    const saved = await this.workspaceRepository.save(workspace);
    if (hasRoutineCapability(saved.workspaceType)) {
      await this.routineTemplatesService.createTemplateForWorkspace(
        userId,
        saved.id,
        saved.name,
      );
    }
    if (saved.workspaceSubtypeId) {
      await this.createDefaultPagesForSubtype(userId, saved.id, saved.workspaceSubtypeId);
    }
    return saved;
  }

  private async createDefaultPagesForSubtype(
    userId: string,
    workspaceId: string,
    subtypeId: string,
  ): Promise<void> {
    const defaultPages = await this.workspaceSubtypesService.getDefaultPages(subtypeId);
    for (let i = 0; i < defaultPages.length; i++) {
      const spec = defaultPages[i];
      const page = this.pageRepository.create({
        workspaceId,
        title: spec.title,
        position: spec.position ?? i,
      });
      await this.pageRepository.save(page);
    }
  }

  async update(id: string, userId: string, dto: UpdateWorkspaceDto): Promise<Workspace> {
    const workspace = await this.findOne(id, userId);
    if (dto.name !== undefined) workspace.name = dto.name;
    if (dto.sortOrder !== undefined) workspace.sortOrder = dto.sortOrder;
    return this.workspaceRepository.save(workspace);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.workspaceRepository.delete(id);
  }
}
