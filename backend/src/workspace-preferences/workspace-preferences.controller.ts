import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
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
