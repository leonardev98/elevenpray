import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type CatalogProductCategory =
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

@Entity('catalog_products')
export class CatalogProduct {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', nullable: true })
  brand: string | null;

  @Column({ type: 'text' })
  category: CatalogProductCategory;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  benefits: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  ingredients: string[] | null;

  @Column({ name: 'concern_tags', type: 'jsonb', nullable: true })
  concernTags: string[] | null;

  @Column({ name: 'skin_type_compatibility', type: 'jsonb', nullable: true })
  skinTypeCompatibility: string[] | null;

  @Column({ name: 'usage_instructions', type: 'text', nullable: true })
  usageInstructions: string | null;

  @Column({ name: 'experience_level', type: 'text', nullable: true })
  experienceLevel: string | null;

  @Column({ type: 'int', nullable: true })
  rating: number | null;

  @Column({ type: 'text', nullable: true })
  warnings: string | null;

  @Column({ name: 'routine_position', type: 'text', nullable: true })
  routinePosition: string | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
