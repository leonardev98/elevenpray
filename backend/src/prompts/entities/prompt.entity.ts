import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PromptFolder } from './prompt-folder.entity';
import { PromptCategory } from './prompt-category.entity';
import { DeveloperProject } from './developer-project.entity';
import { PromptTag } from './prompt-tag.entity';

export const PROMPT_STATUSES = ['active', 'archived', 'draft'] as const;
export type PromptStatus = (typeof PROMPT_STATUSES)[number];

@Entity('prompts')
export class Prompt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'folder_id', type: 'uuid', nullable: true })
  folderId: string | null;

  @ManyToOne(() => PromptFolder, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'folder_id' })
  folder?: PromptFolder | null;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => PromptCategory, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category?: PromptCategory | null;

  @Column({ name: 'project_id', type: 'uuid', nullable: true })
  projectId: string | null;

  @ManyToOne(() => DeveloperProject, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'project_id' })
  project?: DeveloperProject | null;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  slug: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'prompt_type', type: 'text', nullable: true })
  promptType: string | null;

  @Column({ type: 'text', default: 'active' })
  status: PromptStatus;

  @Column({ name: 'repository_name', type: 'text', nullable: true })
  repositoryName: string | null;

  @Column({ name: 'is_favorite', type: 'boolean', default: false })
  isFavorite: boolean;

  @Column({ name: 'is_pinned', type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  createdByUser?: User | null;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'updated_by' })
  updatedByUser?: User | null;

  @ManyToMany(() => PromptTag, (tag) => tag.prompts, { cascade: true })
  @JoinTable({
    name: 'prompt_tag_relations',
    joinColumn: { name: 'prompt_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags?: PromptTag[];
}
