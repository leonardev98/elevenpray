import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { RoutineTemplatesModule } from './routine-templates/routine-templates.module';
import { SpacesModule } from './spaces/spaces.module';
import { PagesModule } from './pages/pages.module';
import { ContainersModule } from './containers/containers.module';
import { BlocksModule } from './blocks/blocks.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { WorkspaceTypesModule } from './workspace-types/workspace-types.module';
import { WorkspaceSubtypesModule } from './workspace-subtypes/workspace-subtypes.module';
import { WorkspacePreferencesModule } from './workspace-preferences/workspace-preferences.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
    }),
    UsersModule,
    AuthModule,
    WorkspaceTypesModule,
    WorkspaceSubtypesModule,
    WorkspacesModule,
    WorkspacePreferencesModule,
    RoutineTemplatesModule,
    SpacesModule,
    PagesModule,
    ContainersModule,
    BlocksModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
