import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceSubtype, type DefaultPageSpec } from './entities/workspace-subtype.entity';

@Injectable()
export class WorkspaceSubtypesService {
  constructor(
    @InjectRepository(WorkspaceSubtype)
    private readonly repo: Repository<WorkspaceSubtype>,
  ) {}

  async getByWorkspaceTypeId(workspaceTypeId: string): Promise<WorkspaceSubtype[]> {
    return this.repo.find({
      where: { workspaceTypeId },
      order: { sortOrder: 'ASC' },
    });
  }

  async getByWorkspaceTypeCode(workspaceTypeCode: string): Promise<WorkspaceSubtype[]> {
    return this.repo
      .createQueryBuilder('s')
      .innerJoin('s.workspaceType', 'wt')
      .where('wt.code = :code', { code: workspaceTypeCode })
      .orderBy('s.sortOrder', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<WorkspaceSubtype | null> {
    return this.repo.findOne({ where: { id } });
  }

  async getDefaultPages(subtypeId: string): Promise<DefaultPageSpec[]> {
    const sub = await this.repo.findOne({ where: { id: subtypeId } });
    return sub?.defaultPages ?? [];
  }
}
