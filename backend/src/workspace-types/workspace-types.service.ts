import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceType } from './entities/workspace-type.entity';
import { WorkspaceTypeDomain } from './entities/workspace-type-domain.entity';
import {
  getWorkspaceType as getFromRegistry,
  getAllWorkspaceTypes,
  type WorkspaceTypeDefinition,
} from './workspace-type.registry';

export interface WorkspaceTypeWithDomain extends WorkspaceTypeDefinition {
  domainCode?: string | null;
}

export interface WorkspaceTypeDomainApi {
  id: string;
  code: string;
  label: string;
  sortOrder: number;
}

@Injectable()
export class WorkspaceTypesService {
  constructor(
    @InjectRepository(WorkspaceType)
    private readonly repo: Repository<WorkspaceType>,
    @InjectRepository(WorkspaceTypeDomain)
    private readonly domainRepo: Repository<WorkspaceTypeDomain>,
  ) {}

  /** Returns type by code from DB, or fallback to in-memory registry. */
  async getByCode(code: string): Promise<WorkspaceTypeDefinition | null> {
    const row = await this.repo.findOne({ where: { code } });
    if (row) {
      return {
        id: row.code,
        label: row.label,
        capabilities: row.capabilities as WorkspaceTypeDefinition['capabilities'],
        sortOrder: row.sortOrder,
      };
    }
    const fromRegistry = getFromRegistry(code);
    return fromRegistry ?? null;
  }

  /** Returns all types from DB if any exist, otherwise from registry. Includes domainCode for grouping. */
  async getAll(): Promise<WorkspaceTypeWithDomain[]> {
    const rows = await this.repo.find({
      relations: ['domain'],
      order: { sortOrder: 'ASC' },
    });
    if (rows.length > 0) {
      return rows.map((row) => ({
        id: row.code,
        label: row.label,
        capabilities: row.capabilities as WorkspaceTypeDefinition['capabilities'],
        sortOrder: row.sortOrder,
        domainCode: row.domain?.code ?? null,
      }));
    }
    const fromRegistry = getAllWorkspaceTypes();
    return fromRegistry.map((t) => ({ ...t, domainCode: null }));
  }

  /** Returns all domains for grouping types in the UI. */
  async getAllDomains(): Promise<WorkspaceTypeDomainApi[]> {
    const rows = await this.domainRepo.find({ order: { sortOrder: 'ASC' } });
    return rows.map((d) => ({
      id: d.id,
      code: d.code,
      label: d.label,
      sortOrder: d.sortOrder,
    }));
  }

  /** Whether the type has routine capability (from DB or registry). */
  async hasRoutineCapability(typeCode: string): Promise<boolean> {
    const def = await this.getByCode(typeCode);
    return def?.capabilities?.hasRoutine === true;
  }
}
