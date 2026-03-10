import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngredientConflict } from './entities/ingredient-conflict.entity';

export interface ConflictResult {
  ingredientA: string;
  ingredientB: string;
  severity: 'warning' | 'danger';
  message: string;
}

/** Normalize ingredient name for matching (lowercase, trim). */
function norm(s: string): string {
  return s.trim().toLowerCase();
}

@Injectable()
export class IngredientConflictsService {
  constructor(
    @InjectRepository(IngredientConflict)
    private readonly repo: Repository<IngredientConflict>,
  ) {}

  /** Check a list of ingredients and return any conflicts between them. */
  async checkIngredients(ingredients: string[], locale = 'es'): Promise<ConflictResult[]> {
    if (!ingredients?.length) return [];
    const set = new Set(ingredients.map(norm));
    const list = Array.from(set);
    const all = await this.repo.find();
    const results: ConflictResult[] = [];
    for (const c of all) {
      const a = norm(c.ingredientA);
      const b = norm(c.ingredientB);
      if (set.has(a) && set.has(b)) {
        results.push({
          ingredientA: c.ingredientA,
          ingredientB: c.ingredientB,
          severity: c.severity,
          message: locale === 'es' && c.messageEs ? c.messageEs : (c.messageEn ?? c.messageEs ?? 'This combination may irritate your skin.'),
        });
      }
    }
    return results;
  }

  async findAll(): Promise<IngredientConflict[]> {
    return this.repo.find({ order: { ingredientA: 'ASC', ingredientB: 'ASC' } });
  }
}
