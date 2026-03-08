import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Space } from './entities/space.entity';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/create-space.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class SpacesService {
  constructor(
    @InjectRepository(Space)
    private readonly spaceRepository: Repository<Space>,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async findAllByWorkspaceId(workspaceId: string, userId: string): Promise<Space[]> {
    await this.workspacesService.findOne(workspaceId, userId);
    return this.spaceRepository.find({
      where: { workspaceId },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(spaceId: string, userId: string): Promise<Space> {
    const space = await this.spaceRepository.findOne({
      where: { id: spaceId },
      relations: ['workspace'],
    });
    if (!space) throw new NotFoundException('Space not found');
    if (space.workspace?.userId !== userId) throw new ForbiddenException();
    return space;
  }

  async create(workspaceId: string, userId: string, dto: CreateSpaceDto): Promise<Space> {
    await this.workspacesService.findOne(workspaceId, userId);
    const count = await this.spaceRepository.count({ where: { workspaceId } });
    const space = this.spaceRepository.create({
      workspaceId,
      title: (dto.title && dto.title.trim()) || 'Sin título',
      position: dto.position ?? count,
    });
    return this.spaceRepository.save(space);
  }

  async update(spaceId: string, userId: string, dto: UpdateSpaceDto): Promise<Space> {
    const space = await this.findOne(spaceId, userId);
    if (dto.title !== undefined) space.title = dto.title.trim();
    if (dto.position !== undefined) space.position = dto.position;
    return this.spaceRepository.save(space);
  }

  async remove(spaceId: string, userId: string): Promise<void> {
    await this.findOne(spaceId, userId);
    await this.spaceRepository.delete(spaceId);
  }
}
