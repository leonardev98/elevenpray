import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface WorkspaceTypeCapabilities {
  hasRoutine?: boolean;
  hasDashboardWidgets?: boolean;
  hasEntries?: boolean;
}

@Entity('workspace_types')
export class WorkspaceType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  code: string;

  @Column({ type: 'text' })
  label: string;

  @Column({ type: 'jsonb', default: {} })
  capabilities: WorkspaceTypeCapabilities;

  @Column({ name: 'default_spaces', type: 'jsonb', nullable: true })
  defaultSpaces: Array<{ title: string; position: number }> | null;

  @Column({ name: 'dashboard_config', type: 'jsonb', nullable: true })
  dashboardConfig: Record<string, unknown> | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
