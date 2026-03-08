import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './entities/block.entity';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/create-block.dto';
import { PagesService } from '../pages/pages.service';

const BLOCK_TYPES = [
  'text', 'heading', 'list', 'checklist', 'image', 'file', 'link', 'code',
  'callout', 'table', 'database', 'container', 'weekly_routine',
] as const;

@Injectable()
export class BlocksService {
  constructor(
    @InjectRepository(Block)
    private readonly blockRepository: Repository<Block>,
    private readonly pagesService: PagesService,
  ) {}

  async findAllByPageId(pageId: string, userId: string): Promise<Block[]> {
    await this.pagesService.findOne(pageId, userId);
    return this.blockRepository.find({
      where: { pageId },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(blockId: string, userId: string): Promise<Block> {
    const block = await this.blockRepository.findOne({
      where: { id: blockId },
      relations: ['page', 'page.workspace'],
    });
    if (!block) throw new NotFoundException('Block not found');
    if (block.page?.workspace?.userId !== userId) throw new ForbiddenException();
    return block;
  }

  async create(pageId: string, userId: string, dto: CreateBlockDto): Promise<Block> {
    await this.pagesService.findOne(pageId, userId);
    const count = await this.blockRepository.count({ where: { pageId } });
    const type = BLOCK_TYPES.includes(dto.type as (typeof BLOCK_TYPES)[number])
      ? dto.type
      : 'text';
    const block = this.blockRepository.create({
      pageId,
      containerId: dto.containerId ?? null,
      type,
      content: dto.content ?? {},
      position: dto.position ?? count,
    });
    return this.blockRepository.save(block);
  }

  async update(blockId: string, userId: string, dto: UpdateBlockDto): Promise<Block> {
    const block = await this.findOne(blockId, userId);
    if (dto.type !== undefined) block.type = dto.type;
    if (dto.containerId !== undefined) block.containerId = dto.containerId;
    if (dto.content !== undefined) block.content = dto.content;
    if (dto.position !== undefined) block.position = dto.position;
    return this.blockRepository.save(block);
  }

  async remove(blockId: string, userId: string): Promise<void> {
    await this.findOne(blockId, userId);
    await this.blockRepository.delete(blockId);
  }

  async reorder(pageId: string, userId: string, blockIds: string[]): Promise<Block[]> {
    await this.pagesService.findOne(pageId, userId);
    const blocks = await this.blockRepository.find({ where: { pageId } });
    const idToBlock = new Map(blocks.map((b) => [b.id, b]));
    blockIds.forEach((id, index) => {
      const block = idToBlock.get(id);
      if (block && block.position !== index) {
        block.position = index;
      }
    });
    await this.blockRepository.save(blocks);
    return this.blockRepository.find({
      where: { pageId },
      order: { position: 'ASC' },
    });
  }
}
