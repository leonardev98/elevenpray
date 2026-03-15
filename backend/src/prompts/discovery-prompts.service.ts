import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiscoveryPrompt } from './entities/discovery-prompt.entity';

@Injectable()
export class DiscoveryPromptsService {
  constructor(
    @InjectRepository(DiscoveryPrompt)
    private readonly repo: Repository<DiscoveryPrompt>,
  ) {}

  async findByLocaleAndSection(
    locale: string,
    section: string,
  ): Promise<DiscoveryPrompt[]> {
    return this.repo.find({
      where: { locale, section },
      order: { sortOrder: 'ASC' },
    });
  }
}
