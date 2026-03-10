import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { hasExpertConsultationCapability } from '../workspace-types/workspace-type.registry';
import { ExpertConsultationExpert } from './entities/expert-consultation-expert.entity';
import { ExpertConsultationSession } from './entities/expert-consultation-session.entity';
import { Workspace } from '../workspaces/entities/workspace.entity';

@Injectable()
export class ExpertConsultationService {
  constructor(
    @InjectRepository(ExpertConsultationExpert)
    private readonly expertRepo: Repository<ExpertConsultationExpert>,
    @InjectRepository(ExpertConsultationSession)
    private readonly sessionRepo: Repository<ExpertConsultationSession>,
    private readonly workspacesService: WorkspacesService,
  ) {}

  /** Throws if workspace not found, not owned by user, or type has no expert consultation. */
  async ensureCapability(workspaceId: string, userId: string): Promise<Workspace> {
    const workspace = await this.workspacesService.findOne(workspaceId, userId);
    if (!hasExpertConsultationCapability(workspace.workspaceType)) {
      throw new ForbiddenException('This workspace type does not have expert consultation');
    }
    return workspace;
  }

  async findAllExperts(workspaceId: string, userId: string): Promise<ExpertConsultationExpert[]> {
    const workspace = await this.ensureCapability(workspaceId, userId);
    return this.expertRepo
      .createQueryBuilder('e')
      .innerJoin(
        'expert_consultation_expert_workspace_types',
        'ewt',
        'ewt.expert_id = e.id AND ewt.workspace_type_code = :workspaceType',
        { workspaceType: workspace.workspaceType },
      )
      .where('e.is_active = true')
      .orderBy('e.name', 'ASC')
      .getMany();
  }

  async findOneExpert(
    workspaceId: string,
    expertId: string,
    userId: string,
  ): Promise<ExpertConsultationExpert> {
    const workspace = await this.ensureCapability(workspaceId, userId);
    const expert = await this.expertRepo
      .createQueryBuilder('e')
      .innerJoin(
        'expert_consultation_expert_workspace_types',
        'ewt',
        'ewt.expert_id = e.id AND ewt.workspace_type_code = :workspaceType',
        { workspaceType: workspace.workspaceType },
      )
      .where('e.id = :expertId', { expertId })
      .andWhere('e.is_active = true')
      .getOne();
    if (!expert) throw new NotFoundException('Expert not found');
    const withRelations = await this.expertRepo.findOne({
      where: { id: expertId },
      relations: ['specialties', 'specialties.specialty'],
    });
    if (!withRelations) throw new NotFoundException('Expert not found');
    return withRelations;
  }

  async findSessionsByWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<ExpertConsultationSession[]> {
    await this.ensureCapability(workspaceId, userId);
    return this.sessionRepo.find({
      where: { workspaceId, userId },
      relations: ['expert'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOneSession(
    workspaceId: string,
    sessionId: string,
    userId: string,
  ): Promise<ExpertConsultationSession> {
    await this.ensureCapability(workspaceId, userId);
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId, workspaceId, userId },
      relations: ['expert', 'messages'],
      order: { messages: { createdAt: 'ASC' } },
    });
    if (!session) throw new NotFoundException('Session not found');
    return session;
  }
}
