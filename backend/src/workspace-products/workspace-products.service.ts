import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceProduct } from './entities/workspace-product.entity';
import { CreateWorkspaceProductDto } from './dto/create-workspace-product.dto';
import { UpdateWorkspaceProductDto } from './dto/create-workspace-product.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';
import type { ProductStatus } from './entities/workspace-product.entity';

@Injectable()
export class WorkspaceProductsService {
  constructor(
    @InjectRepository(WorkspaceProduct)
    private readonly repo: Repository<WorkspaceProduct>,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async findAllByWorkspaceId(
    workspaceId: string,
    userId: string,
    filters?: { status?: ProductStatus; category?: string },
  ): Promise<WorkspaceProduct[]> {
    await this.workspacesService.findOne(workspaceId, userId);
    const qb = this.repo
      .createQueryBuilder('p')
      .where('p.workspace_id = :workspaceId', { workspaceId })
      .orderBy('p.name', 'ASC');
    if (filters?.status) {
      qb.andWhere('p.status = :status', { status: filters.status });
    }
    if (filters?.category) {
      qb.andWhere('p.category = :category', { category: filters.category });
    }
    return qb.getMany();
  }

  async findOne(productId: string, userId: string): Promise<WorkspaceProduct> {
    const product = await this.repo.findOne({
      where: { id: productId },
      relations: ['workspace'],
    });
    if (!product) throw new NotFoundException('Product not found');
    if (product.workspace?.userId !== userId) throw new NotFoundException('Product not found');
    return product;
  }

  async create(
    workspaceId: string,
    userId: string,
    dto: CreateWorkspaceProductDto,
  ): Promise<WorkspaceProduct> {
    await this.workspacesService.findOne(workspaceId, userId);
    const product = this.repo.create({
      workspaceId,
      name: dto.name.trim() || 'Sin nombre',
      brand: dto.brand?.trim() ?? null,
      category: dto.category,
      textureFormat: dto.textureFormat?.trim() ?? null,
      mainIngredients: dto.mainIngredients ?? null,
      usageTime: dto.usageTime ?? null,
      status: dto.status,
      dateOpened: dto.dateOpened ?? null,
      expirationDate: dto.expirationDate ?? null,
      notes: dto.notes?.trim() ?? null,
      rating: dto.rating ?? null,
      reactionNotes: dto.reactionNotes?.trim() ?? null,
      imageUrl: dto.imageUrl ?? null,
    });
    return this.repo.save(product);
  }

  async update(
    productId: string,
    userId: string,
    dto: UpdateWorkspaceProductDto,
  ): Promise<WorkspaceProduct> {
    const product = await this.findOne(productId, userId);
    if (dto.name !== undefined) product.name = dto.name.trim();
    if (dto.brand !== undefined) product.brand = dto.brand?.trim() ?? null;
    if (dto.category !== undefined) product.category = dto.category;
    if (dto.textureFormat !== undefined) product.textureFormat = dto.textureFormat?.trim() ?? null;
    if (dto.mainIngredients !== undefined) product.mainIngredients = dto.mainIngredients;
    if (dto.usageTime !== undefined) product.usageTime = dto.usageTime;
    if (dto.status !== undefined) product.status = dto.status;
    if (dto.dateOpened !== undefined) product.dateOpened = dto.dateOpened;
    if (dto.expirationDate !== undefined) product.expirationDate = dto.expirationDate;
    if (dto.notes !== undefined) product.notes = dto.notes?.trim() ?? null;
    if (dto.rating !== undefined) product.rating = dto.rating;
    if (dto.reactionNotes !== undefined) product.reactionNotes = dto.reactionNotes?.trim() ?? null;
    if (dto.imageUrl !== undefined) product.imageUrl = dto.imageUrl;
    return this.repo.save(product);
  }

  async remove(productId: string, userId: string): Promise<void> {
    await this.findOne(productId, userId);
    await this.repo.delete(productId);
  }
}
