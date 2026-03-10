import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceCheckin } from './entities/workspace-checkin.entity';
import { WorkspaceCheckinsController } from './workspace-checkins.controller';
import { WorkspaceCheckinsService } from './workspace-checkins.service';
import { AuthModule } from '../auth/auth.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceCheckin]),
    AuthModule,
    WorkspacesModule,
  ],
  controllers: [WorkspaceCheckinsController],
  providers: [WorkspaceCheckinsService],
  exports: [WorkspaceCheckinsService],
})
export class WorkspaceCheckinsModule {}
