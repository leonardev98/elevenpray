import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceCheckin } from './entities/workspace-checkin.entity';
import { CreateWorkspaceCheckinDto } from './dto/create-workspace-checkin.dto';
import { UpdateWorkspaceCheckinDto } from './dto/create-workspace-checkin.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class WorkspaceCheckinsService {
  constructor(
    @InjectRepository(WorkspaceCheckin)
    private readonly repo: Repository<WorkspaceCheckin>,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async findAllByWorkspaceId(
    workspaceId: string,
    userId: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<WorkspaceCheckin[]> {
    await this.workspacesService.findOne(workspaceId, userId);
    const qb = this.repo
      .createQueryBuilder('c')
      .where('c.workspace_id = :workspaceId', { workspaceId })
      .orderBy('c.checkin_date', 'DESC');
    if (fromDate) {
      qb.andWhere('c.checkin_date >= :fromDate', { fromDate });
    }
    if (toDate) {
      qb.andWhere('c.checkin_date <= :toDate', { toDate });
    }
    return qb.getMany();
  }

  async findOne(checkinId: string, userId: string): Promise<WorkspaceCheckin> {
    const checkin = await this.repo.findOne({
      where: { id: checkinId },
      relations: ['workspace'],
    });
    if (!checkin) throw new NotFoundException('Check-in not found');
    if (checkin.workspace?.userId !== userId) throw new NotFoundException('Check-in not found');
    return checkin;
  }

  async findByWorkspaceAndDate(
    workspaceId: string,
    checkinDate: string,
    userId: string,
  ): Promise<WorkspaceCheckin | null> {
    await this.workspacesService.findOne(workspaceId, userId);
    return this.repo.findOne({
      where: { workspaceId, checkinDate },
    });
  }

  async create(
    workspaceId: string,
    userId: string,
    dto: CreateWorkspaceCheckinDto,
  ): Promise<WorkspaceCheckin> {
    await this.workspacesService.findOne(workspaceId, userId);
    const checkin = this.repo.create({
      workspaceId,
      checkinDate: dto.checkinDate,
      data: dto.data ?? null,
    });
    return this.repo.save(checkin);
  }

  async update(
    checkinId: string,
    userId: string,
    dto: UpdateWorkspaceCheckinDto,
  ): Promise<WorkspaceCheckin> {
    const checkin = await this.findOne(checkinId, userId);
    if (dto.checkinDate !== undefined) checkin.checkinDate = dto.checkinDate;
    if (dto.data !== undefined) checkin.data = dto.data;
    return this.repo.save(checkin);
  }

  async remove(checkinId: string, userId: string): Promise<void> {
    await this.findOne(checkinId, userId);
    await this.repo.delete(checkinId);
  }
}
