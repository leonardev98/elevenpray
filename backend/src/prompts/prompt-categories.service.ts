import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromptCategory } from './entities/prompt-category.entity';

@Injectable()
export class PromptCategoriesService {
  constructor(
    @InjectRepository(PromptCategory)
    private readonly repo: Repository<PromptCategory>,
  ) {}

  async findAll(): Promise<PromptCategory[]> {
    return this.repo.find({ order: { code: 'ASC' } });
  }

  async findOneByCode(code: string): Promise<PromptCategory | null> {
    return this.repo.findOne({ where: { code } });
  }
}
