import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prompt } from './entities/prompt.entity';
import { PromptFolder } from './entities/prompt-folder.entity';
import { PromptCategory } from './entities/prompt-category.entity';
import { DeveloperProject } from './entities/developer-project.entity';
import { PromptTag } from './entities/prompt-tag.entity';
import { PromptsService } from './prompts.service';
import { PromptFoldersService } from './prompt-folders.service';
import { PromptCategoriesService } from './prompt-categories.service';
import { DeveloperProjectsService } from './developer-projects.service';
import { PromptTagsService } from './prompt-tags.service';
import { PromptsController } from './prompts.controller';
import { PromptFoldersController } from './prompt-folders.controller';
import { PromptCategoriesController } from './prompt-categories.controller';
import { DeveloperProjectsController } from './developer-projects.controller';
import { PromptTagsController } from './prompt-tags.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Prompt,
      PromptFolder,
      PromptCategory,
      DeveloperProject,
      PromptTag,
    ]),
    AuthModule,
  ],
  controllers: [
    PromptsController,
    PromptFoldersController,
    PromptCategoriesController,
    DeveloperProjectsController,
    PromptTagsController,
  ],
  providers: [
    PromptsService,
    PromptFoldersService,
    PromptCategoriesService,
    DeveloperProjectsService,
    PromptTagsService,
  ],
  exports: [PromptsService],
})
export class PromptsModule {}
