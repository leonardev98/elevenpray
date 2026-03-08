import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceType } from './entities/workspace-type.entity';
import {
  getWorkspaceType as getFromRegistry,
  getAllWorkspaceTypes,
  type WorkspaceTypeDefinition,
} from './workspace-type.registry';

@Injectable()
export class WorkspaceTypesService {
  constructor(
    @InjectRepository(WorkspaceType)
    private readonly repo: Repository<WorkspaceType>,
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

  /** Returns all types from DB if any exist, otherwise from registry. */
  async getAll(): Promise<WorkspaceTypeDefinition[]> {
    const rows = await this.repo.find({ order: { sortOrder: 'ASC' } });
    if (rows.length > 0) {
      return rows.map((row) => ({
        id: row.code,
        label: row.label,
        capabilities: row.capabilities as WorkspaceTypeDefinition['capabilities'],
        sortOrder: row.sortOrder,
      }));
    }
    return getAllWorkspaceTypes();
  }

  /** Whether the type has routine capability (from DB or registry). */
  async hasRoutineCapability(typeCode: string): Promise<boolean> {
    const def = await this.getByCode(typeCode);
    return def?.capabilities?.hasRoutine === true;
  }
}
