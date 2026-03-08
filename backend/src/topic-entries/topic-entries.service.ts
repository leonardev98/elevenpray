import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TopicEntry } from './entities/topic-entry.entity';
import { CreateTopicEntryDto } from './dto/create-topic-entry.dto';
import { UpdateTopicEntryDto } from './dto/create-topic-entry.dto';
import { TopicsService } from '../topics/topics.service';

@Injectable()
export class TopicEntriesService {
  constructor(
    @InjectRepository(TopicEntry)
    private readonly entryRepository: Repository<TopicEntry>,
    private readonly topicsService: TopicsService,
  ) {}

  async findByTopicAndRange(
    topicId: string,
    userId: string,
    from: string,
    to: string,
  ): Promise<TopicEntry[]> {
    await this.topicsService.findOne(topicId, userId);
    return this.entryRepository
      .createQueryBuilder('e')
      .where('e.topic_id = :topicId', { topicId })
      .andWhere('e.entry_date >= :from', { from })
      .andWhere('e.entry_date <= :to', { to })
      .orderBy('e.entry_date', 'ASC')
      .getMany();
  }

  async findByUserAndDateRange(
    userId: string,
    from: string,
    to: string,
  ): Promise<TopicEntry[]> {
    return this.entryRepository
      .createQueryBuilder('e')
      .where('e.user_id = :userId', { userId })
      .andWhere('e.entry_date >= :from', { from })
      .andWhere('e.entry_date <= :to', { to })
      .orderBy('e.entry_date', 'ASC')
      .getMany();
  }

  async findOne(id: string, userId: string): Promise<TopicEntry> {
    const entry = await this.entryRepository.findOne({ where: { id } });
    if (!entry) throw new NotFoundException('Topic entry not found');
    if (entry.userId !== userId) throw new ForbiddenException();
    return entry;
  }

  async create(
    topicId: string,
    userId: string,
    dto: CreateTopicEntryDto,
  ): Promise<TopicEntry> {
    await this.topicsService.findOne(topicId, userId);
    const entry = this.entryRepository.create({
      topicId,
      userId,
      entryDate: dto.entryDate,
      content: dto.content ?? null,
      imageUrl: dto.imageUrl ?? null,
    });
    return this.entryRepository.save(entry);
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateTopicEntryDto,
  ): Promise<TopicEntry> {
    const entry = await this.findOne(id, userId);
    if (dto.entryDate !== undefined) entry.entryDate = dto.entryDate;
    if (dto.content !== undefined) entry.content = dto.content;
    if (dto.imageUrl !== undefined) entry.imageUrl = dto.imageUrl;
    return this.entryRepository.save(entry);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.entryRepository.delete(id);
  }
}
