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
import { Workspace } from '../../workspaces/entities/workspace.entity';

@Entity('user_ui_state')
export class UserUiState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'current_workspace_id', type: 'uuid', nullable: true })
  currentWorkspaceId: string | null;

  @ManyToOne(() => Workspace, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'current_workspace_id' })
  currentWorkspace?: Workspace | null;

  @Column({ name: 'selected_workspace_ids', type: 'uuid', array: true, default: [] })
  selectedWorkspaceIds: string[];

  @Column({ name: 'sidebar_collapsed', type: 'boolean', default: false })
  sidebarCollapsed: boolean;

  /** Workspace whose routine is shown on the weekly dashboard; only one can be active. */
  @Column({ name: 'active_routine_workspace_id', type: 'uuid', nullable: true })
  activeRoutineWorkspaceId: string | null;

  @ManyToOne(() => Workspace, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'active_routine_workspace_id' })
  activeRoutineWorkspace?: Workspace | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
