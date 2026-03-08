import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WorkspaceType } from '../../workspace-types/entities/workspace-type.entity';

export interface DefaultPageSpec {
  title: string;
  position: number;
}

@Entity('workspace_subtypes')
export class WorkspaceSubtype {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_type_id', type: 'uuid' })
  workspaceTypeId: string;

  @ManyToOne(() => WorkspaceType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_type_id' })
  workspaceType?: WorkspaceType;

  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'text' })
  label: string;

  @Column({ name: 'default_pages', type: 'jsonb', nullable: true })
  defaultPages: DefaultPageSpec[] | null;

  @Column({ name: 'default_blocks', type: 'jsonb', nullable: true })
  defaultBlocks: Record<string, unknown> | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
