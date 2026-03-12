import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, ILike } from 'typeorm';
import { Prompt } from './entities/prompt.entity';
import { CreatePromptDto, UpdatePromptDto } from './dto/create-prompt.dto';
import { ListPromptsQueryDto } from './dto/list-prompts-query.dto';
import { PromptTagsService } from './prompt-tags.service';

@Injectable()
export class PromptsService {
  constructor(
    @InjectRepository(Prompt)
    private readonly repo: Repository<Prompt>,
    private readonly promptTagsService: PromptTagsService,
  ) {}

  async findAll(userId: string, query: ListPromptsQueryDto): Promise<Prompt[]> {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.folder', 'folder')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.project', 'project')
      .leftJoinAndSelect('p.tags', 'tags')
      .where('p.user_id = :userId', { userId })
      .andWhere('p.deleted_at IS NULL');

    if (query.folderId) {
      qb.andWhere('p.folder_id = :folderId', { folderId: query.folderId });
    }
    if (query.categoryId) {
      qb.andWhere('p.category_id = :categoryId', { categoryId: query.categoryId });
    }
    if (query.projectId) {
      qb.andWhere('p.project_id = :projectId', { projectId: query.projectId });
    }
    if (query.isFavorite === true) {
      qb.andWhere('p.is_favorite = true');
    }
    if (query.status) {
      qb.andWhere('p.status = :status', { status: query.status });
    }
    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      qb.andWhere(
        '(p.title ILIKE :term OR p.description ILIKE :term OR p.content ILIKE :term)',
        { term },
      );
    }
    if (query.recent === true) {
      qb.andWhere('p.last_used_at IS NOT NULL');
      qb.orderBy('p.last_used_at', 'DESC');
    } else {
      const sortBy = query.sortBy ?? 'updated_at';
      const sortOrder = (query.sortOrder ?? 'desc').toUpperCase() as 'ASC' | 'DESC';
      qb.orderBy(`p.${sortBy}`, sortOrder);
    }

    return qb.getMany();
  }

  async findOne(id: string, userId: string): Promise<Prompt> {
    const prompt = await this.repo.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['folder', 'category', 'project', 'tags'],
    });
    if (!prompt) throw new NotFoundException('Prompt not found');
    if (prompt.userId !== userId) throw new ForbiddenException();
    return prompt;
  }

  private async resolveTags(tagIds?: string[], tagNames?: string[], existingTagIds?: string[]): Promise<string[]> {
    const tagEntities: { id: string }[] = [];
    if (tagIds?.length) {
      const byId = await this.promptTagsService.findByIds(tagIds);
      tagEntities.push(...byId);
    }
    if (tagNames?.length) {
      const byName = await this.promptTagsService.findOrCreateByNames(tagNames);
      byName.forEach((t) => {
        if (!tagEntities.find((e) => e.id === t.id)) tagEntities.push(t);
      });
    }
    const ids = [...new Set(tagEntities.map((t) => t.id))];
    return ids;
  }

  async create(userId: string, dto: CreatePromptDto): Promise<Prompt> {
    const slug = dto.slug?.trim() || null;
    if (slug) {
      const existing = await this.repo.findOne({
        where: { userId, slug, deletedAt: IsNull() },
      });
      if (existing) throw new ConflictException('Slug already in use');
    }

    const tagIds = await this.resolveTags(dto.tagIds, dto.tagNames);
    const tags = tagIds.length
      ? await this.promptTagsService.findByIds(tagIds)
      : [];

    const prompt = this.repo.create({
      userId,
      folderId: dto.folderId ?? null,
      categoryId: dto.categoryId ?? null,
      projectId: dto.projectId ?? null,
      title: dto.title,
      slug: slug || null,
      description: dto.description ?? null,
      content: dto.content,
      promptType: dto.promptType ?? null,
      status: (dto.status as Prompt['status']) ?? 'active',
      repositoryName: dto.repositoryName ?? null,
      isFavorite: dto.isFavorite ?? false,
      isPinned: dto.isPinned ?? false,
      createdBy: userId,
      updatedBy: userId,
      tags,
    });
    const saved = await this.repo.save(prompt);
    return this.findOne(saved.id, userId);
  }

  async update(id: string, userId: string, dto: UpdatePromptDto): Promise<Prompt> {
    const prompt = await this.findOne(id, userId);

    if (dto.slug !== undefined) {
      const slug = dto.slug?.trim() || null;
      if (slug && slug !== prompt.slug) {
        const existing = await this.repo.findOne({
          where: { userId, slug, deletedAt: IsNull() },
        });
        if (existing) throw new ConflictException('Slug already in use');
      }
      prompt.slug = slug;
    }

    if (dto.title !== undefined) prompt.title = dto.title;
    if (dto.description !== undefined) prompt.description = dto.description;
    if (dto.content !== undefined) prompt.content = dto.content;
    if (dto.promptType !== undefined) prompt.promptType = dto.promptType;
    if (dto.status !== undefined) prompt.status = dto.status as Prompt['status'];
    if (dto.folderId !== undefined) prompt.folderId = dto.folderId;
    if (dto.categoryId !== undefined) prompt.categoryId = dto.categoryId;
    if (dto.projectId !== undefined) prompt.projectId = dto.projectId;
    if (dto.repositoryName !== undefined) prompt.repositoryName = dto.repositoryName;
    if (dto.isFavorite !== undefined) prompt.isFavorite = dto.isFavorite;
    if (dto.isPinned !== undefined) prompt.isPinned = dto.isPinned;
    prompt.updatedBy = userId;

    if (dto.tagIds !== undefined || dto.tagNames !== undefined) {
      const tagIds = await this.resolveTags(dto.tagIds, dto.tagNames);
      prompt.tags = tagIds.length
        ? await this.promptTagsService.findByIds(tagIds)
        : [];
    }

    await this.repo.save(prompt);
    return this.findOne(id, userId);
  }

  async remove(id: string, userId: string): Promise<void> {
    const prompt = await this.findOne(id, userId);
    prompt.deletedAt = new Date();
    prompt.updatedBy = userId;
    await this.repo.save(prompt);
  }

  async duplicate(id: string, userId: string): Promise<Prompt> {
    const source = await this.findOne(id, userId);
    const dto: CreatePromptDto = {
      title: `${source.title} (copy)`,
      content: source.content,
      description: source.description ?? undefined,
      slug: undefined,
      folderId: source.folderId ?? undefined,
      categoryId: source.categoryId ?? undefined,
      projectId: source.projectId ?? undefined,
      repositoryName: source.repositoryName ?? undefined,
      promptType: source.promptType ?? undefined,
      status: source.status,
      isFavorite: false,
      isPinned: false,
      tagNames: source.tags?.map((t) => t.name),
    };
    return this.create(userId, dto);
  }

  async setFavorite(id: string, userId: string, value: boolean): Promise<Prompt> {
    const prompt = await this.findOne(id, userId);
    prompt.isFavorite = value;
    prompt.updatedBy = userId;
    await this.repo.save(prompt);
    return this.findOne(id, userId);
  }

  async setPinned(id: string, userId: string, value: boolean): Promise<Prompt> {
    const prompt = await this.findOne(id, userId);
    prompt.isPinned = value;
    prompt.updatedBy = userId;
    await this.repo.save(prompt);
    return this.findOne(id, userId);
  }

  async archive(id: string, userId: string): Promise<Prompt> {
    const prompt = await this.findOne(id, userId);
    prompt.status = 'archived';
    prompt.updatedBy = userId;
    await this.repo.save(prompt);
    return this.findOne(id, userId);
  }

  async unarchive(id: string, userId: string): Promise<Prompt> {
    const prompt = await this.findOne(id, userId);
    prompt.status = 'active';
    prompt.updatedBy = userId;
    await this.repo.save(prompt);
    return this.findOne(id, userId);
  }

  async recordUse(id: string, userId: string): Promise<Prompt> {
    const prompt = await this.findOne(id, userId);
    prompt.lastUsedAt = new Date();
    await this.repo.save(prompt);
    return this.findOne(id, userId);
  }
}
