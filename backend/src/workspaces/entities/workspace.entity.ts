import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { WorkspaceSubtype } from '../../workspace-subtypes/entities/workspace-subtype.entity';
import { WORKSPACE_TYPE_IDS } from '../../workspace-types/workspace-type.registry';

export type WorkspaceType = (typeof WORKSPACE_TYPE_IDS)[number];

@Entity('workspaces')
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'text' })
  name: string;

  @Column({ name: 'workspace_type', type: 'text' })
  workspaceType: WorkspaceType;

  @Column({ name: 'workspace_subtype_id', type: 'uuid', nullable: true })
  workspaceSubtypeId: string | null;

  @ManyToOne(() => WorkspaceSubtype, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'workspace_subtype_id' })
  workspaceSubtype?: WorkspaceSubtype | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
