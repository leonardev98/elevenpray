import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DeveloperProjectsService } from './developer-projects.service';
import {
  CreateDeveloperProjectDto,
  UpdateDeveloperProjectDto,
} from './dto/create-project.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { PublicUser } from '../auth/auth.service';

@Controller('developer-projects')
@UseGuards(JwtAuthGuard)
export class DeveloperProjectsController {
  constructor(
    private readonly developerProjectsService: DeveloperProjectsService,
  ) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.developerProjectsService.findAllByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.developerProjectsService.findOne(id, userId);
  }

  @Post()
  create(
    @Body() dto: CreateDeveloperProjectDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.developerProjectsService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDeveloperProjectDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.developerProjectsService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.developerProjectsService.remove(id, user.id);
  }
}
