import { Controller, Post, Body, Query, UseGuards } from '@nestjs/common';
import { IngredientConflictsService, ConflictResult } from './ingredient-conflicts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('ingredient-conflicts')
@UseGuards(JwtAuthGuard)
export class IngredientConflictsController {
  constructor(private readonly service: IngredientConflictsService) {}

  @Post('check')
  check(
    @Body() body: { ingredients: string[] },
    @Query('locale') locale?: string,
  ): Promise<ConflictResult[]> {
    const ingredients = Array.isArray(body.ingredients) ? body.ingredients : [];
    return this.service.checkIngredients(ingredients, locale === 'en' ? 'en' : 'es');
  }
}
