import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserWorkspacePreference } from './entities/user-workspace-preference.entity';
import { UserUiState } from './entities/user-ui-state.entity';
import { UpdateWorkspacePreferenceDto } from './dto/update-preference.dto';
import { UpdateUiStateDto } from './dto/update-ui-state.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class WorkspacePreferencesService {
  constructor(
    @InjectRepository(UserWorkspacePreference)
    private readonly prefRepo: Repository<UserWorkspacePreference>,
    @InjectRepository(UserUiState)
    private readonly uiStateRepo: Repository<UserUiState>,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async getPreferences(userId: string): Promise<UserWorkspacePreference[]> {
    return this.prefRepo.find({
      where: { userId },
      order: { sortOrder: 'ASC' },
    });
  }

  async getPreference(userId: string, workspaceId: string): Promise<UserWorkspacePreference | null> {
    await this.workspacesService.findOne(workspaceId, userId);
    return this.prefRepo.findOne({ where: { userId, workspaceId } });
  }

  async upsertPreference(
    userId: string,
    workspaceId: string,
    dto: UpdateWorkspacePreferenceDto,
  ): Promise<UserWorkspacePreference> {
    await this.workspacesService.findOne(workspaceId, userId);
    let pref = await this.prefRepo.findOne({ where: { userId, workspaceId } });
    if (!pref) {
      pref = this.prefRepo.create({ userId, workspaceId });
      pref = await this.prefRepo.save(pref);
    }
    if (dto.favorite !== undefined) pref.favorite = dto.favorite;
    if (dto.visibleOnDashboard !== undefined) pref.visibleOnDashboard = dto.visibleOnDashboard;
    if (dto.sortOrder !== undefined) pref.sortOrder = dto.sortOrder;
    if (dto.completeOnboarding === true) {
      pref.onboardingCompletedAt = new Date();
      pref.onboardingAnswers = dto.onboardingAnswers ?? pref.onboardingAnswers;
    } else if (dto.onboardingAnswers !== undefined) {
      pref.onboardingAnswers = dto.onboardingAnswers;
    }
    return this.prefRepo.save(pref);
  }

  async getUiState(userId: string): Promise<UserUiState> {
    let state = await this.uiStateRepo.findOne({ where: { userId } });
    if (!state) {
      state = this.uiStateRepo.create({ userId });
      state = await this.uiStateRepo.save(state);
    }
    return state;
  }

  async updateUiState(userId: string, dto: UpdateUiStateDto): Promise<UserUiState> {
    let state = await this.uiStateRepo.findOne({ where: { userId } });
    if (!state) {
      state = this.uiStateRepo.create({ userId });
      state = await this.uiStateRepo.save(state);
    }
    if (dto.currentWorkspaceId !== undefined) {
      if (dto.currentWorkspaceId !== null) {
        await this.workspacesService.findOne(dto.currentWorkspaceId, userId);
      }
      state.currentWorkspaceId = dto.currentWorkspaceId;
    }
    if (dto.selectedWorkspaceIds !== undefined) {
      for (const wid of dto.selectedWorkspaceIds) {
        await this.workspacesService.findOne(wid, userId);
      }
      state.selectedWorkspaceIds = dto.selectedWorkspaceIds;
    }
    if (dto.sidebarCollapsed !== undefined) state.sidebarCollapsed = dto.sidebarCollapsed;
    return this.uiStateRepo.save(state);
  }

  /** Returns workspace IDs that are visible on dashboard for the user (for scope filtering). */
  async getVisibleWorkspaceIds(userId: string): Promise<string[]> {
    const prefs = await this.prefRepo.find({
      where: { userId, visibleOnDashboard: true },
      select: ['workspaceId'],
    });
    return prefs.map((p) => p.workspaceId);
  }

  /** Returns workspace IDs that are favorited. */
  async getFavoriteWorkspaceIds(userId: string): Promise<string[]> {
    const prefs = await this.prefRepo.find({
      where: { userId, favorite: true },
      select: ['workspaceId'],
    });
    return prefs.map((p) => p.workspaceId);
  }
}
