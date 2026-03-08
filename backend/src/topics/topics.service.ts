import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/create-topic.dto';
import { RoutinesService } from '../routines/routines.service';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    private readonly routinesService: RoutinesService,
  ) {}

  async findAllByUserId(userId: string): Promise<Topic[]> {
    return this.topicRepository.find({
      where: { userId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Topic> {
    const topic = await this.topicRepository.findOne({ where: { id } });
    if (!topic) throw new NotFoundException('Topic not found');
    if (topic.userId !== userId) throw new ForbiddenException();
    return topic;
  }

  async create(userId: string, dto: CreateTopicDto): Promise<Topic> {
    const count = await this.topicRepository.count({ where: { userId } });
    const topic = this.topicRepository.create({
      userId,
      title: dto.title,
      type: dto.type as Topic['type'],
      sortOrder: count,
    });
    const saved = await this.topicRepository.save(topic);
    if (dto.type === 'rutina') {
      await this.routinesService.createTemplateForTopic(userId, saved.id, saved.title);
    }
    return saved;
  }

  async update(id: string, userId: string, dto: UpdateTopicDto): Promise<Topic> {
    const topic = await this.findOne(id, userId);
    if (dto.title !== undefined) topic.title = dto.title;
    if (dto.sortOrder !== undefined) topic.sortOrder = dto.sortOrder;
    return this.topicRepository.save(topic);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.topicRepository.delete(id);
  }
}
