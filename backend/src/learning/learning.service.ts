import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningArticle } from './entities/learning-article.entity';
import { LearningVideo } from './entities/learning-video.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { CreateVideoDto } from './dto/create-video.dto';

@Injectable()
export class LearningService {
  constructor(
    @InjectRepository(LearningArticle)
    private readonly articleRepo: Repository<LearningArticle>,
    @InjectRepository(LearningVideo)
    private readonly videoRepo: Repository<LearningVideo>,
  ) {}

  async findArticles(language?: string, featured?: boolean): Promise<LearningArticle[]> {
    const qb = this.articleRepo
      .createQueryBuilder('a')
      .orderBy('a.created_at', 'DESC');

    if (language) {
      qb.andWhere('a.language = :language', { language });
    }
    if (featured === true) {
      qb.andWhere('a.is_featured = :featured', { featured: true });
    }
    return qb.getMany();
  }

  async findVideos(language?: string): Promise<LearningVideo[]> {
    const qb = this.videoRepo
      .createQueryBuilder('v')
      .orderBy('v.created_at', 'DESC');

    if (language) {
      qb.andWhere('v.language = :language', { language });
    }
    return qb.getMany();
  }

  async createArticle(dto: CreateArticleDto): Promise<LearningArticle> {
    const article = this.articleRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      url: dto.url,
      imageUrl: dto.image_url ?? null,
      sourceName: dto.source_name ?? null,
      tags: dto.tags ?? null,
      language: dto.language ?? 'es',
      isFeatured: dto.is_featured ?? false,
    });
    return this.articleRepo.save(article);
  }

  async createVideo(dto: CreateVideoDto): Promise<LearningVideo> {
    const video = this.videoRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      videoUrl: dto.video_url,
      thumbnailUrl: dto.thumbnail_url ?? null,
      sourceName: dto.source_name ?? null,
      tags: dto.tags ?? null,
      language: dto.language ?? 'es',
    });
    return this.videoRepo.save(video);
  }
}
