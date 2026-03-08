import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Page } from '../../pages/entities/page.entity';
import { Container } from '../../containers/entities/container.entity';

@Entity('blocks')
export class Block {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'page_id', type: 'uuid' })
  pageId: string;

  @ManyToOne(() => Page, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'page_id' })
  page?: Page;

  @Column({ name: 'container_id', type: 'uuid', nullable: true })
  containerId: string | null;

  @ManyToOne(() => Container, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'container_id' })
  container?: Container | null;

  @Column({ type: 'text' })
  type: string;

  @Column({ type: 'jsonb', default: {} })
  content: Record<string, unknown>;

  @Column({ type: 'int', default: 0 })
  position: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
