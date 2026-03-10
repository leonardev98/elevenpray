import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspacePhoto } from './entities/workspace-photo.entity';
import { WorkspacePhotosController } from './workspace-photos.controller';
import { WorkspacePhotosService } from './workspace-photos.service';
import { AuthModule } from '../auth/auth.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspacePhoto]),
    AuthModule,
    WorkspacesModule,
  ],
  controllers: [WorkspacePhotosController],
  providers: [WorkspacePhotosService],
  exports: [WorkspacePhotosService],
})
export class WorkspacePhotosModule {}
