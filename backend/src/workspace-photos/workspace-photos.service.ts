import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspacePhoto } from './entities/workspace-photo.entity';
import { CreateWorkspacePhotoDto } from './dto/create-workspace-photo.dto';
import { UpdateWorkspacePhotoDto } from './dto/create-workspace-photo.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class WorkspacePhotosService {
  constructor(
    @InjectRepository(WorkspacePhoto)
    private readonly repo: Repository<WorkspacePhoto>,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async findAllByWorkspaceId(
    workspaceId: string,
    userId: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<WorkspacePhoto[]> {
    await this.workspacesService.findOne(workspaceId, userId);
    const qb = this.repo
      .createQueryBuilder('p')
      .where('p.workspace_id = :workspaceId', { workspaceId })
      .orderBy('p.photo_date', 'DESC')
      .addOrderBy('p.angle', 'ASC');
    if (fromDate) {
      qb.andWhere('p.photo_date >= :fromDate', { fromDate });
    }
    if (toDate) {
      qb.andWhere('p.photo_date <= :toDate', { toDate });
    }
    return qb.getMany();
  }

  async findOne(photoId: string, userId: string): Promise<WorkspacePhoto> {
    const photo = await this.repo.findOne({
      where: { id: photoId },
      relations: ['workspace'],
    });
    if (!photo) throw new NotFoundException('Photo not found');
    if (photo.workspace?.userId !== userId) throw new NotFoundException('Photo not found');
    return photo;
  }

  async create(
    workspaceId: string,
    userId: string,
    dto: CreateWorkspacePhotoDto,
  ): Promise<WorkspacePhoto> {
    await this.workspacesService.findOne(workspaceId, userId);
    const photo = this.repo.create({
      workspaceId,
      photoDate: dto.photoDate,
      angle: dto.angle,
      notes: dto.notes?.trim() ?? null,
      concernTags: dto.concernTags ?? null,
      imageUrl: dto.imageUrl.trim(),
    });
    return this.repo.save(photo);
  }

  async update(
    photoId: string,
    userId: string,
    dto: UpdateWorkspacePhotoDto,
  ): Promise<WorkspacePhoto> {
    const photo = await this.findOne(photoId, userId);
    if (dto.photoDate !== undefined) photo.photoDate = dto.photoDate;
    if (dto.angle !== undefined) photo.angle = dto.angle;
    if (dto.notes !== undefined) photo.notes = dto.notes?.trim() ?? null;
    if (dto.concernTags !== undefined) photo.concernTags = dto.concernTags;
    if (dto.imageUrl !== undefined) photo.imageUrl = dto.imageUrl.trim();
    return this.repo.save(photo);
  }

  async remove(photoId: string, userId: string): Promise<void> {
    await this.findOne(photoId, userId);
    await this.repo.delete(photoId);
  }
}
