import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { WorkspaceType } from './entities/workspace-type.entity';
import { WorkspaceTypesController } from './workspace-types.controller';
import { WorkspaceTypesService } from './workspace-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceType]), AuthModule],
  controllers: [WorkspaceTypesController],
  providers: [WorkspaceTypesService],
  exports: [WorkspaceTypesService],
})
export class WorkspaceTypesModule {}
