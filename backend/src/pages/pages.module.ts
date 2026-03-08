import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from './entities/page.entity';
import { PagesController } from './pages.controller';
import { WorkspacePagesController } from './workspace-pages.controller';
import { PagesService } from './pages.service';
import { AuthModule } from '../auth/auth.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { SpacesModule } from '../spaces/spaces.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Page]),
    AuthModule,
    WorkspacesModule,
    SpacesModule,
  ],
  controllers: [PagesController, WorkspacePagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
