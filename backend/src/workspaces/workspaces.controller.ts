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
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/create-workspace.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { PublicUser } from '../auth/auth.service';
import { RoutineTemplatesService } from '../routine-templates/routine-templates.service';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly routineTemplatesService: RoutineTemplatesService,
  ) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.workspacesService.findAllByUserId(userId);
  }

  @Get(':workspaceId/routine-templates')
  findRoutineTemplates(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.routineTemplatesService.findByWorkspaceId(workspaceId, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.workspacesService.findOne(id, userId);
  }

  @Post()
  create(@Body() dto: CreateWorkspaceDto, @CurrentUser() user: PublicUser) {
    return this.workspacesService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWorkspaceDto,
    @CurrentUser() user: PublicUser,
  ) {
    return this.workspacesService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: PublicUser) {
    return this.workspacesService.remove(id, user.id);
  }
}
