import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { WorkspaceSubtype } from './entities/workspace-subtype.entity';
import { WorkspaceSubtypesController } from './workspace-subtypes.controller';
import { WorkspaceSubtypesService } from './workspace-subtypes.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkspaceSubtype]), AuthModule],
  controllers: [WorkspaceSubtypesController],
  providers: [WorkspaceSubtypesService],
  exports: [WorkspaceSubtypesService],
})
export class WorkspaceSubtypesModule {}
