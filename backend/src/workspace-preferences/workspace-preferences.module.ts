import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { UserWorkspacePreference } from './entities/user-workspace-preference.entity';
import { UserUiState } from './entities/user-ui-state.entity';
import { WorkspacePreferencesController } from './workspace-preferences.controller';
import { WorkspacePreferencesService } from './workspace-preferences.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserWorkspacePreference, UserUiState]),
    AuthModule,
    WorkspacesModule,
  ],
  controllers: [WorkspacePreferencesController],
  providers: [WorkspacePreferencesService],
  exports: [WorkspacePreferencesService],
})
export class WorkspacePreferencesModule {}
