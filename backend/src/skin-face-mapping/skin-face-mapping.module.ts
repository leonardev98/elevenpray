import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkinFaceSession } from './entities/skin-face-session.entity';
import { SkinFaceMarker } from './entities/skin-face-marker.entity';
import { SkinFaceMappingController } from './skin-face-mapping.controller';
import { SkinFaceMappingService } from './skin-face-mapping.service';
import { AuthModule } from '../auth/auth.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SkinFaceSession, SkinFaceMarker]),
    AuthModule,
    WorkspacesModule,
  ],
  controllers: [SkinFaceMappingController],
  providers: [SkinFaceMappingService],
  exports: [SkinFaceMappingService],
})
export class SkinFaceMappingModule {}
