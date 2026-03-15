import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AuthModule } from '../auth/auth.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { RoutineTemplatesModule } from '../routine-templates/routine-templates.module';
import { WorkspacePreferencesModule } from '../workspace-preferences/workspace-preferences.module';
import { RoutineProvider } from './providers/routine.provider';
import { EntriesProvider } from './providers/entries.provider';
import { WorkspaceSummaryProvider } from './providers/workspace-summary.provider';
import { StudyUniversityModule } from '../study-university/study-university.module';

@Module({
  imports: [
    AuthModule,
    WorkspacesModule,
    RoutineTemplatesModule,
    WorkspacePreferencesModule,
    StudyUniversityModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, RoutineProvider, EntriesProvider, WorkspaceSummaryProvider],
})
export class DashboardModule {}
