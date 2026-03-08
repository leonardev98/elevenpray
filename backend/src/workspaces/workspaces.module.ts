import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { AuthModule } from '../auth/auth.module';
import { RoutineTemplatesModule } from '../routine-templates/routine-templates.module';
import { WorkspaceSubtypesModule } from '../workspace-subtypes/workspace-subtypes.module';
import { Page } from '../pages/entities/page.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, Page]),
    AuthModule,
    RoutineTemplatesModule,
    WorkspaceSubtypesModule,
  ],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
