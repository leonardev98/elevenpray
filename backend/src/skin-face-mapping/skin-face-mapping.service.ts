import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SkinFaceSession } from './entities/skin-face-session.entity';
import { SkinFaceMarker } from './entities/skin-face-marker.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { CreateMarkerDto, UpdateMarkerDto } from './dto/create-marker.dto';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class SkinFaceMappingService {
  constructor(
    @InjectRepository(SkinFaceSession)
    private readonly sessionRepo: Repository<SkinFaceSession>,
    @InjectRepository(SkinFaceMarker)
    private readonly markerRepo: Repository<SkinFaceMarker>,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async findAllSessions(
    workspaceId: string,
    userId: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<SkinFaceSession[]> {
    await this.workspacesService.findOne(workspaceId, userId);
    const qb = this.sessionRepo
      .createQueryBuilder('s')
      .where('s.workspace_id = :workspaceId', { workspaceId })
      .orderBy('s.session_date', 'DESC')
      .addOrderBy('s.created_at', 'DESC');
    if (fromDate) {
      qb.andWhere('s.session_date >= :fromDate', { fromDate });
    }
    if (toDate) {
      qb.andWhere('s.session_date <= :toDate', { toDate });
    }
    return qb.getMany();
  }

  async createSession(
    workspaceId: string,
    userId: string,
    dto: CreateSessionDto,
  ): Promise<SkinFaceSession> {
    await this.workspacesService.findOne(workspaceId, userId);
    const session = this.sessionRepo.create({
      workspaceId,
      sessionDate: dto.sessionDate,
      faceModelType: dto.faceModelType,
    });
    return this.sessionRepo.save(session);
  }

  async findAllMarkers(
    workspaceId: string,
    userId: string,
    sessionId?: string,
    fromDate?: string,
    toDate?: string,
    faceModelType?: 'female' | 'male',
  ): Promise<SkinFaceMarker[]> {
    await this.workspacesService.findOne(workspaceId, userId);
    const qb = this.markerRepo
      .createQueryBuilder('m')
      .where('m.workspace_id = :workspaceId', { workspaceId })
      .orderBy('m.created_at', 'DESC');
    if (sessionId) {
      qb.andWhere('m.session_id = :sessionId', { sessionId });
    }
    if (fromDate) {
      qb.andWhere('m.created_at >= :fromDate', {
        fromDate: `${fromDate}T00:00:00.000Z`,
      });
    }
    if (toDate) {
      qb.andWhere('m.created_at <= :toDate', {
        toDate: `${toDate}T23:59:59.999Z`,
      });
    }
    if (faceModelType) {
      qb.andWhere('m.face_model_type = :faceModelType', { faceModelType });
    }
    return qb.getMany();
  }

  async findOneMarker(markerId: string, userId: string): Promise<SkinFaceMarker> {
    const marker = await this.markerRepo.findOne({
      where: { id: markerId },
      relations: ['workspace'],
    });
    if (!marker) throw new NotFoundException('Marker not found');
    if (marker.workspace?.userId !== userId) throw new NotFoundException('Marker not found');
    return marker;
  }

  async createMarker(
    workspaceId: string,
    userId: string,
    dto: CreateMarkerDto,
  ): Promise<SkinFaceMarker> {
    await this.workspacesService.findOne(workspaceId, userId);
    const marker = this.markerRepo.create({
      workspaceId,
      sessionId: dto.sessionId ?? null,
      faceModelType: dto.faceModelType,
      issueType: dto.issueType,
      severity: dto.severity,
      notes: dto.notes?.trim() ?? null,
      x: dto.x,
      y: dto.y,
      z: dto.z,
      regionLabel: dto.regionLabel?.trim() ?? null,
      photoUrl: dto.photoUrl?.trim() ?? null,
    });
    return this.markerRepo.save(marker);
  }

  async updateMarker(
    markerId: string,
    userId: string,
    dto: UpdateMarkerDto,
  ): Promise<SkinFaceMarker> {
    const marker = await this.findOneMarker(markerId, userId);
    if (dto.issueType !== undefined) marker.issueType = dto.issueType;
    if (dto.severity !== undefined) marker.severity = dto.severity;
    if (dto.notes !== undefined) marker.notes = dto.notes?.trim() ?? null;
    if (dto.regionLabel !== undefined) marker.regionLabel = dto.regionLabel?.trim() ?? null;
    if (dto.photoUrl !== undefined) marker.photoUrl = dto.photoUrl?.trim() ?? null;
    return this.markerRepo.save(marker);
  }

  async removeMarker(markerId: string, userId: string): Promise<void> {
    await this.findOneMarker(markerId, userId);
    await this.markerRepo.delete(markerId);
  }
}
