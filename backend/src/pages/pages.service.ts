import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/create-page.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { SpacesService } from '../spaces/spaces.service';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
    private readonly workspacesService: WorkspacesService,
    private readonly spacesService: SpacesService,
  ) {}

  private async assertPageAccess(pageId: string, userId: string): Promise<Page> {
    const page = await this.pageRepository.findOne({
      where: { id: pageId },
      relations: ['workspace'],
    });
    if (!page) throw new NotFoundException('Page not found');
    if (page.workspace?.userId !== userId) throw new ForbiddenException();
    return page;
  }

  async findRootPages(workspaceId: string, userId: string): Promise<Page[]> {
    await this.workspacesService.findOne(workspaceId, userId);
    return this.pageRepository.find({
      where: { workspaceId, parentPageId: IsNull() },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async findChildren(pageId: string, userId: string): Promise<Page[]> {
    await this.assertPageAccess(pageId, userId);
    return this.pageRepository.find({
      where: { parentPageId: pageId },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(pageId: string, userId: string): Promise<Page> {
    return this.assertPageAccess(pageId, userId);
  }

  async create(
    workspaceId: string,
    userId: string,
    dto: CreatePageDto,
    parentPageId?: string | null,
  ): Promise<Page> {
    await this.workspacesService.findOne(workspaceId, userId);
    if (dto.spaceId) {
      await this.spacesService.findOne(dto.spaceId, userId);
    }
    if (parentPageId) {
      await this.assertPageAccess(parentPageId, userId);
    }
    const count = parentPageId
      ? await this.pageRepository.count({ where: { parentPageId } })
      : await this.pageRepository.count({ where: { workspaceId, parentPageId: IsNull() } });
    const page = this.pageRepository.create({
      workspaceId,
      spaceId: dto.spaceId ?? null,
      parentPageId: parentPageId ?? dto.parentPageId ?? null,
      title: (dto.title && dto.title.trim()) || 'Sin título',
      position: dto.position ?? count,
    });
    return this.pageRepository.save(page);
  }

  async update(pageId: string, userId: string, dto: UpdatePageDto): Promise<Page> {
    const page = await this.assertPageAccess(pageId, userId);
    if (dto.title !== undefined) page.title = dto.title.trim();
    if (dto.spaceId !== undefined) page.spaceId = dto.spaceId;
    if (dto.position !== undefined) page.position = dto.position;
    return this.pageRepository.save(page);
  }

  async remove(pageId: string, userId: string): Promise<void> {
    await this.assertPageAccess(pageId, userId);
    await this.pageRepository.delete(pageId);
  }
}
