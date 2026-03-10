import { Body, Controller, Get, Param, Patch, UseGuards, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WorkspacePreferencesService } from './workspace-preferences.service';
import { UpdateWorkspacePreferenceDto } from './dto/update-preference.dto';
import { UpdateUiStateDto } from './dto/update-ui-state.dto';

@Controller('workspace-preferences')
@UseGuards(JwtAuthGuard)
export class WorkspacePreferencesController {
  constructor(private readonly service: WorkspacePreferencesService) {}

  @Get()
  async getPreferences(@CurrentUser('id') userId: string) {
    return this.service.getPreferences(userId);
  }

  @Get('workspaces/:workspaceId')
  async getPreference(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    const pref = await this.service.getPreference(userId, workspaceId);
    if (!pref) throw new NotFoundException('Preference not found');
    return pref;
  }

  @Patch('workspaces/:workspaceId')
  async upsertPreference(
    @CurrentUser('id') userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: UpdateWorkspacePreferenceDto,
  ) {
    return this.service.upsertPreference(userId, workspaceId, dto);
  }

  @Get('ui-state')
  async getUiState(@CurrentUser('id') userId: string) {
    return this.service.getUiState(userId);
  }

  @Patch('ui-state')
  async updateUiState(@CurrentUser('id') userId: string, @Body() dto: UpdateUiStateDto) {
    return this.service.updateUiState(userId, dto);
  }
}
