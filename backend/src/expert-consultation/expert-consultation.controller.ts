import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ExpertConsultationService } from './expert-consultation.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('workspaces/:workspaceId')
@UseGuards(JwtAuthGuard)
export class ExpertConsultationController {
  constructor(private readonly service: ExpertConsultationService) {}

  @Get('experts')
  findAllExperts(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.findAllExperts(workspaceId, userId);
  }

  @Get('experts/:expertId')
  findOneExpert(
    @Param('workspaceId') workspaceId: string,
    @Param('expertId') expertId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.findOneExpert(workspaceId, expertId, userId);
  }

  @Get('expert-sessions')
  findSessions(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.findSessionsByWorkspace(workspaceId, userId);
  }

  @Get('expert-sessions/:sessionId')
  findOneSession(
    @Param('workspaceId') workspaceId: string,
    @Param('sessionId') sessionId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.findOneSession(workspaceId, sessionId, userId);
  }
}
