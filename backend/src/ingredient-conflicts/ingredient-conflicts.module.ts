import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientConflict } from './entities/ingredient-conflict.entity';
import { IngredientConflictsService } from './ingredient-conflicts.service';
import { IngredientConflictsController } from './ingredient-conflicts.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([IngredientConflict]), AuthModule],
  controllers: [IngredientConflictsController],
  providers: [IngredientConflictsService],
  exports: [IngredientConflictsService],
})
export class IngredientConflictsModule {}
