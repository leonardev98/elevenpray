import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prompt } from './entities/prompt.entity';
import { PromptFolder } from './entities/prompt-folder.entity';
import { PromptCategory } from './entities/prompt-category.entity';
import { DeveloperProject } from './entities/developer-project.entity';
import { PromptTag } from './entities/prompt-tag.entity';
import { DiscoveryPrompt } from './entities/discovery-prompt.entity';
import { PromptsService } from './prompts.service';
import { DiscoveryPromptsService } from './discovery-prompts.service';
import { DiscoveryPromptsController } from './discovery-prompts.controller';
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
      DiscoveryPrompt,
    ]),
    AuthModule,
  ],
  controllers: [
    PromptsController,
    PromptFoldersController,
    PromptCategoriesController,
    DeveloperProjectsController,
    PromptTagsController,
    DiscoveryPromptsController,
  ],
  providers: [
    PromptsService,
    PromptFoldersService,
    PromptCategoriesService,
    DeveloperProjectsService,
    PromptTagsService,
    DiscoveryPromptsService,
  ],
  exports: [PromptsService],
})
export class PromptsModule {}
