import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromptFolder } from './entities/prompt-folder.entity';
import { CreatePromptFolderDto, UpdatePromptFolderDto } from './dto/create-folder.dto';

@Injectable()
export class PromptFoldersService {
  constructor(
    @InjectRepository(PromptFolder)
    private readonly repo: Repository<PromptFolder>,
  ) {}

  async findAllByUserId(userId: string): Promise<PromptFolder[]> {
    return this.repo.find({
      where: { userId },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<PromptFolder> {
    const folder = await this.repo.findOne({ where: { id } });
    if (!folder) throw new NotFoundException('Folder not found');
    if (folder.userId !== userId) throw new ForbiddenException();
    return folder;
  }

  async create(userId: string, dto: CreatePromptFolderDto): Promise<PromptFolder> {
    const count = await this.repo.count({ where: { userId } });
    const folder = this.repo.create({
      userId,
      name: dto.name,
      sortOrder: dto.sortOrder ?? count,
    });
    return this.repo.save(folder);
  }

  async update(id: string, userId: string, dto: UpdatePromptFolderDto): Promise<PromptFolder> {
    const folder = await this.findOne(id, userId);
    if (dto.name !== undefined) folder.name = dto.name;
    if (dto.sortOrder !== undefined) folder.sortOrder = dto.sortOrder;
    return this.repo.save(folder);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId);
    await this.repo.delete(id);
  }
}
