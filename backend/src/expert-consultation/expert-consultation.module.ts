import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertConsultationExpert } from './entities/expert-consultation-expert.entity';
import { ExpertConsultationSpecialty } from './entities/expert-consultation-specialty.entity';
import { ExpertConsultationExpertWorkspaceType } from './entities/expert-consultation-expert-workspace-type.entity';
import { ExpertConsultationExpertSpecialty } from './entities/expert-consultation-expert-specialty.entity';
import { ExpertConsultationSession } from './entities/expert-consultation-session.entity';
import { ExpertConsultationMessage } from './entities/expert-consultation-message.entity';
import { ExpertConsultationController } from './expert-consultation.controller';
import { ExpertConsultationService } from './expert-consultation.service';
import { AuthModule } from '../auth/auth.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ExpertConsultationExpert,
      ExpertConsultationSpecialty,
      ExpertConsultationExpertWorkspaceType,
      ExpertConsultationExpertSpecialty,
      ExpertConsultationSession,
      ExpertConsultationMessage,
    ]),
    AuthModule,
    WorkspacesModule,
  ],
  controllers: [ExpertConsultationController],
  providers: [ExpertConsultationService],
  exports: [ExpertConsultationService],
})
export class ExpertConsultationModule {}
