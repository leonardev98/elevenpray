import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { WorkspaceType } from './entities/workspace-type.entity';
import { WorkspaceTypeDomain } from './entities/workspace-type-domain.entity';
import { WorkspaceTypesController } from './workspace-types.controller';
import { WorkspaceTypesService } from './workspace-types.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkspaceType, WorkspaceTypeDomain]),
    AuthModule,
  ],
  controllers: [WorkspaceTypesController],
  providers: [WorkspaceTypesService],
  exports: [WorkspaceTypesService],
})
export class WorkspaceTypesModule {}
