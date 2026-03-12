import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, In } from 'typeorm';
import { PromptTag } from './entities/prompt-tag.entity';

@Injectable()
export class PromptTagsService {
  constructor(
    @InjectRepository(PromptTag)
    private readonly repo: Repository<PromptTag>,
  ) {}

  async findAll(search?: string): Promise<PromptTag[]> {
    if (search?.trim()) {
      return this.repo.find({
        where: { name: ILike(`%${search.trim()}%`) },
        order: { name: 'ASC' },
        take: 50,
      });
    }
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOrCreateByName(name: string): Promise<PromptTag> {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) throw new Error('Tag name is required');
    let tag = await this.repo.findOne({ where: { name: trimmed } });
    if (!tag) {
      tag = this.repo.create({ name: trimmed });
      tag = await this.repo.save(tag);
    }
    return tag;
  }

  async findOrCreateByNames(names: string[]): Promise<PromptTag[]> {
    const result: PromptTag[] = [];
    for (const name of names) {
      if (!name?.trim()) continue;
      const tag = await this.findOrCreateByName(name);
      if (!result.find((t) => t.id === tag.id)) result.push(tag);
    }
    return result;
  }

  async findByIds(ids: string[]): Promise<PromptTag[]> {
    if (!ids?.length) return [];
    return this.repo.find({ where: { id: In(ids) } });
  }
}
