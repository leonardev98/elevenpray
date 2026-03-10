import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workspace } from '../../workspaces/entities/workspace.entity';

export type ProductCategory =
  | 'cleanser'
  | 'moisturizer'
  | 'sunscreen'
  | 'serum'
  | 'retinoid'
  | 'exfoliant'
  | 'toner'
  | 'eye_care'
  | 'spot_treatment'
  | 'mask'
  | 'oil'
  | 'essence'
  | 'balm';

export type ProductStatus = 'active' | 'testing' | 'paused' | 'finished' | 'wishlist';

export type UsageTime = 'am' | 'pm' | 'both';

@Entity('workspace_products')
export class WorkspaceProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspace_id' })
  workspace?: Workspace;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  brand: string | null;

  @Column({ type: 'text' })
  category: ProductCategory;

  @Column({ name: 'texture_format', type: 'text', nullable: true })
  textureFormat: string | null;

  @Column({ name: 'main_ingredients', type: 'jsonb', nullable: true })
  mainIngredients: string[] | null;

  @Column({ name: 'usage_time', type: 'text', nullable: true })
  usageTime: UsageTime | null;

  @Column({ type: 'text' })
  status: ProductStatus;

  @Column({ name: 'date_opened', type: 'date', nullable: true })
  dateOpened: string | null;

  @Column({ name: 'expiration_date', type: 'date', nullable: true })
  expirationDate: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'int', nullable: true })
  rating: number | null;

  @Column({ name: 'reaction_notes', type: 'text', nullable: true })
  reactionNotes: string | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
