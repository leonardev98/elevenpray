import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogProduct } from './entities/catalog-product.entity';
import { CatalogProductBookmark } from './entities/catalog-product-bookmark.entity';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { translateToEnglish, translateToSpanish } from '../common/translate';

export type CatalogLocale = 'es' | 'en';

export interface CatalogListFilters {
  category?: string;
  concern?: string;
  search?: string;
}

async function resolveDescription(
  product: CatalogProduct,
  locale?: string,
): Promise<string | null> {
  const useEn = locale === 'en';
  if (useEn) {
    if (product.descriptionEn?.trim()) return product.descriptionEn;
    if (product.description?.trim()) return translateToEnglish(product.description);
  } else {
    if (product.description?.trim()) return product.description;
    if (product.descriptionEn?.trim()) return translateToSpanish(product.descriptionEn);
  }
  return product.description ?? product.descriptionEn ?? null;
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
    locale?: string,
  ): Promise<CatalogProduct[]> {
    await this.workspacesService.findOne(workspaceId, userId);
    const list = await this.findPublished(filters);
    const effectiveLocale = locale === 'en' ? 'en' : 'es';
    const results = await Promise.all(
      list.map(async (p) => ({
        ...p,
        description: await resolveDescription(p, effectiveLocale),
      })),
    );
    return results;
  }

  async findOneForWorkspace(
    workspaceId: string,
    userId: string,
    productId: string,
    locale?: string,
  ): Promise<CatalogProduct> {
    await this.workspacesService.findOne(workspaceId, userId);
    const product = await this.findOne(productId);
    const effectiveLocale = locale === 'en' ? 'en' : 'es';
    const description = await resolveDescription(product, effectiveLocale);
    return { ...product, description };
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
