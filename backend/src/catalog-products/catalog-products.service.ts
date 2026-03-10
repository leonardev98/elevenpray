import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CatalogProduct } from './entities/catalog-product.entity';
import { CatalogProductBookmark } from './entities/catalog-product-bookmark.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';

export interface CatalogListFilters {
  category?: string;
  concern?: string;
  search?: string;
}

@Injectable()
export class CatalogProductsService {
  constructor(
    @InjectRepository(CatalogProduct)
    private readonly catalogRepo: Repository<CatalogProduct>,
    @InjectRepository(CatalogProductBookmark)
    private readonly bookmarkRepo: Repository<CatalogProductBookmark>,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async findPublishedForWorkspace(
    workspaceId: string,
    userId: string,
    filters?: CatalogListFilters,
  ): Promise<CatalogProduct[]> {
    await this.workspacesService.findOne(workspaceId, userId);
    return this.findPublished(filters);
  }

  async findOneForWorkspace(
    workspaceId: string,
    userId: string,
    productId: string,
  ): Promise<CatalogProduct> {
    await this.workspacesService.findOne(workspaceId, userId);
    return this.findOne(productId);
  }

  private async findPublished(filters?: CatalogListFilters): Promise<CatalogProduct[]> {
    const qb = this.catalogRepo
      .createQueryBuilder('p')
      .where('p.published = :published', { published: true })
      .orderBy('p.sort_order', 'ASC')
      .addOrderBy('p.name', 'ASC');

    if (filters?.category) {
      qb.andWhere('p.category = :category', { category: filters.category });
    }
    if (filters?.concern) {
      qb.andWhere("p.concern_tags @> :concern", { concern: JSON.stringify([filters.concern]) });
    }
    if (filters?.search?.trim()) {
      const term = `%${filters.search.trim()}%`;
      qb.andWhere('(p.name ILIKE :term OR p.brand ILIKE :term)', { term });
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<CatalogProduct> {
    const product = await this.catalogRepo.findOne({ where: { id, published: true } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async getBookmarkedIds(userId: string, workspaceId: string): Promise<string[]> {
    await this.workspacesService.findOne(workspaceId, userId);
    const rows = await this.bookmarkRepo.find({
      where: { userId, workspaceId },
      select: ['catalogProductId'],
    });
    return rows.map((r) => r.catalogProductId);
  }

  async addBookmark(userId: string, workspaceId: string, catalogProductId: string): Promise<CatalogProductBookmark> {
    await this.workspacesService.findOne(workspaceId, userId);
    await this.findOne(catalogProductId);
    let bookmark = await this.bookmarkRepo.findOne({
      where: { userId, workspaceId, catalogProductId },
    });
    if (bookmark) return bookmark;
    bookmark = this.bookmarkRepo.create({ userId, workspaceId, catalogProductId });
    return this.bookmarkRepo.save(bookmark);
  }

  async removeBookmark(userId: string, workspaceId: string, catalogProductId: string): Promise<void> {
    await this.workspacesService.findOne(workspaceId, userId);
    await this.bookmarkRepo.delete({ userId, workspaceId, catalogProductId });
  }
}
