import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('ingredient_conflicts')
export class IngredientConflict {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ingredient_a', type: 'text' })
  ingredientA: string;

  @Column({ name: 'ingredient_b', type: 'text' })
  ingredientB: string;

  @Column({ type: 'text' })
  severity: 'warning' | 'danger';

  @Column({ name: 'message_es', type: 'text', nullable: true })
  messageEs: string | null;

  @Column({ name: 'message_en', type: 'text', nullable: true })
  messageEn: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
