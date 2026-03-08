import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Container } from './entities/container.entity';
import { CreateContainerDto } from './dto/create-container.dto';
import { UpdateContainerDto } from './dto/create-container.dto';
import { PagesService } from '../pages/pages.service';

@Injectable()
export class ContainersService {
  constructor(
    @InjectRepository(Container)
    private readonly containerRepository: Repository<Container>,
    private readonly pagesService: PagesService,
  ) {}

  async findAllByPageId(pageId: string, userId: string): Promise<Container[]> {
    await this.pagesService.findOne(pageId, userId);
    return this.containerRepository.find({
      where: { pageId },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(containerId: string, userId: string): Promise<Container> {
    const container = await this.containerRepository.findOne({
      where: { id: containerId },
      relations: ['page', 'page.workspace'],
    });
    if (!container) throw new NotFoundException('Container not found');
    if (container.page?.workspace?.userId !== userId) throw new ForbiddenException();
    return container;
  }

  async create(
    pageId: string,
    userId: string,
    dto: CreateContainerDto,
  ): Promise<Container> {
    await this.pagesService.findOne(pageId, userId);
    const count = await this.containerRepository.count({ where: { pageId } });
    const container = this.containerRepository.create({
      pageId,
      title: dto.title ?? '',
      position: dto.position ?? count,
    });
    return this.containerRepository.save(container);
  }

  async update(
    containerId: string,
    userId: string,
    dto: UpdateContainerDto,
  ): Promise<Container> {
    const container = await this.findOne(containerId, userId);
    if (dto.title !== undefined) container.title = dto.title;
    if (dto.position !== undefined) container.position = dto.position;
    return this.containerRepository.save(container);
  }

  async remove(containerId: string, userId: string): Promise<void> {
    await this.findOne(containerId, userId);
    await this.containerRepository.delete(containerId);
  }
}
