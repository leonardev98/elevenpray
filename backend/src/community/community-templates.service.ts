import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  CommunityAcademicTemplate,
  TEMPLATE_CAREERS,
  TEMPLATE_TYPES,
  TemplateCareer,
  TemplateType,
} from './entities/community-academic-template.entity';
import { CommunityTemplateSave } from './entities/community-template-save.entity';
import { UserXpEvent } from './entities/user-xp-event.entity';
import { User } from '../users/entities/user.entity';
import { CreateAcademicTemplateDto } from './dto/community-template.dto';
import { S3Service } from '../s3/s3.service';

const TEMPLATE_CONTENT_TYPE_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'docx',
};

const ALLOWED_TEMPLATE_MIMES = new Set(Object.keys(TEMPLATE_CONTENT_TYPE_EXT));
const MAX_TEMPLATE_BYTES = 10 * 1024 * 1024;
const XP_TEMPLATE_APPROVED = 200;

export interface AcademicTemplateDto {
  id: string;
  type: TemplateType;
  title: string;
  career: TemplateCareer;
  subject: string;
  subjectTags: string[];
  description: string;
  university: string | null;
  status: string;
  downloadCount: number;
  saveCount: number;
  isFeatured: boolean;
  isNewThisWeek: boolean;
  savedByMe: boolean;
  authorName: string;
  authorId: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdAt: string;
  approvedAt: string | null;
}

export interface TopContributorDto {
  id: string;
  name: string;
  university: string | null;
  contributions: number;
  initial: string;
}

@Injectable()
export class CommunityTemplatesService {
  constructor(
    @InjectRepository(CommunityAcademicTemplate)
    private readonly templateRepo: Repository<CommunityAcademicTemplate>,
    @InjectRepository(CommunityTemplateSave)
    private readonly saveRepo: Repository<CommunityTemplateSave>,
    @InjectRepository(UserXpEvent)
    private readonly xpRepo: Repository<UserXpEvent>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly s3Service: S3Service,
  ) {}

  private shortAuthorName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return 'Estudiante';
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1].charAt(0)}.`;
  }

  private isNewThisWeek(createdAt: Date, approvedAt: Date | null): boolean {
    const ref = approvedAt ?? createdAt;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return ref >= weekAgo;
  }

  private async getSavedIds(
    userId: string,
    templateIds: string[],
  ): Promise<Set<string>> {
    if (templateIds.length === 0) return new Set();
    const rows = await this.saveRepo.find({
      where: { userId, templateId: In(templateIds) },
    });
    return new Set(rows.map((r) => r.templateId));
  }

  private async toDto(
    t: CommunityAcademicTemplate,
    author: User,
    savedByMe: boolean,
  ): Promise<AcademicTemplateDto> {
    return {
      id: t.id,
      type: t.type,
      title: t.title,
      career: t.career,
      subject: t.subject,
      subjectTags: [t.subject],
      description: t.description,
      university: t.university,
      status: t.status,
      downloadCount: t.downloadCount,
      saveCount: t.saveCount,
      isFeatured: t.isFeatured,
      isNewThisWeek: this.isNewThisWeek(t.createdAt, t.approvedAt),
      savedByMe,
      authorName: this.shortAuthorName(author.name),
      authorId: author.id,
      attachmentUrl: t.attachmentUrl,
      attachmentName: t.attachmentName,
      createdAt: t.createdAt.toISOString(),
      approvedAt: t.approvedAt?.toISOString() ?? null,
    };
  }

  private async mapTemplates(
    templates: CommunityAcademicTemplate[],
    viewerId: string,
  ): Promise<AcademicTemplateDto[]> {
    if (templates.length === 0) return [];
    const authorIds = [...new Set(templates.map((t) => t.userId))];
    const authors = await this.userRepo.find({ where: { id: In(authorIds) } });
    const authorMap = new Map(authors.map((a) => [a.id, a]));
    const savedIds = await this.getSavedIds(
      viewerId,
      templates.map((t) => t.id),
    );
    const result: AcademicTemplateDto[] = [];
    for (const t of templates) {
      const author = authorMap.get(t.userId);
      if (!author) continue;
      result.push(await this.toDto(t, author, savedIds.has(t.id)));
    }
    return result;
  }

  private sortTemplates(
    templates: CommunityAcademicTemplate[],
    universityFirst: boolean,
    userUniversity: string | null,
  ): CommunityAcademicTemplate[] {
    const uni = userUniversity?.trim().toUpperCase() ?? '';
    return [...templates].sort((a, b) => {
      if (universityFirst && uni) {
        const aMatch = (a.university ?? '').toUpperCase() === uni ? 0 : 1;
        const bMatch = (b.university ?? '').toUpperCase() === uni ? 0 : 1;
        if (aMatch !== bMatch) return aMatch - bMatch;
      }
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  async getViewerUniversity(userId: string): Promise<string | null> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return user?.studentUniversity ?? null;
  }

  async listApproved(
    userId: string,
    opts: {
      career?: string;
      types?: string;
      universityFirst?: boolean;
    },
  ): Promise<AcademicTemplateDto[]> {
    const qb = this.templateRepo
      .createQueryBuilder('t')
      .where('t.status = :status', { status: 'approved' });

    if (opts.career && opts.career !== 'todas') {
      if (!(TEMPLATE_CAREERS as readonly string[]).includes(opts.career)) {
        throw new BadRequestException('Carrera inválida');
      }
      qb.andWhere('t.career = :career', { career: opts.career });
    }

    if (opts.types) {
      const typeList = opts.types
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const valid = typeList.filter((t) =>
        (TEMPLATE_TYPES as readonly string[]).includes(t),
      );
      if (valid.length > 0) {
        qb.andWhere('t.type IN (:...types)', { types: valid });
      }
    }

    let templates = await qb.getMany();
    const userUni = await this.getViewerUniversity(userId);
    if (opts.universityFirst) {
      templates = this.sortTemplates(templates, true, userUni);
    } else {
      templates = this.sortTemplates(templates, false, userUni);
    }
    return this.mapTemplates(templates, userId);
  }

  async listMine(userId: string): Promise<AcademicTemplateDto[]> {
    const templates = await this.templateRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return this.mapTemplates(templates, userId);
  }

  async listSaved(userId: string): Promise<AcademicTemplateDto[]> {
    const saves = await this.saveRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    if (saves.length === 0) return [];
    const ids = saves.map((s) => s.templateId);
    const templates = await this.templateRepo.find({
      where: { id: In(ids), status: 'approved' },
    });
    const orderMap = new Map(ids.map((id, i) => [id, i]));
    templates.sort(
      (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0),
    );
    return this.mapTemplates(templates, userId);
  }

  async topContributors(limit = 3): Promise<TopContributorDto[]> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const rows = await this.templateRepo
      .createQueryBuilder('t')
      .select('t.user_id', 'userId')
      .addSelect('COUNT(*)', 'count')
      .where('t.status = :status', { status: 'approved' })
      .andWhere('t.approved_at >= :start', { start: startOfMonth })
      .groupBy('t.user_id')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany<{ userId: string; count: string }>();

    if (rows.length === 0) return [];
    const users = await this.userRepo.find({
      where: { id: In(rows.map((r) => r.userId)) },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return rows
      .map((r) => {
        const user = userMap.get(r.userId);
        if (!user) return null;
        return {
          id: user.id,
          name: this.shortAuthorName(user.name),
          university: user.studentUniversity,
          contributions: Number(r.count),
          initial: user.name.trim().charAt(0).toUpperCase() || 'E',
        };
      })
      .filter((x): x is TopContributorDto => x !== null);
  }

  async create(
    userId: string,
    dto: CreateAcademicTemplateDto,
  ): Promise<AcademicTemplateDto> {
    if (!dto.authorshipConfirmed) {
      throw new BadRequestException('Debes confirmar la autoría del contenido');
    }
    if (!ALLOWED_TEMPLATE_MIMES.has(dto.attachmentMime)) {
      throw new BadRequestException('Solo se permiten archivos PDF o DOCX');
    }
    if (dto.attachmentSizeBytes > MAX_TEMPLATE_BYTES) {
      throw new BadRequestException('El archivo no puede superar 10 MB');
    }

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const template = this.templateRepo.create({
      userId,
      type: dto.type,
      title: dto.title.trim(),
      career: dto.career,
      subject: dto.subject.trim(),
      description: dto.description.trim(),
      university: user.studentUniversity,
      attachmentUrl: dto.attachmentUrl,
      attachmentName: dto.attachmentName,
      attachmentSizeBytes: String(dto.attachmentSizeBytes),
      attachmentMime: dto.attachmentMime,
      status: 'pending',
      authorshipConfirmed: true,
    });
    const saved = await this.templateRepo.save(template);
    return (await this.mapTemplates([saved], userId))[0];
  }

  async saveTemplate(
    templateId: string,
    userId: string,
  ): Promise<{ saved: boolean; saveCount: number }> {
    const template = await this.templateRepo.findOne({
      where: { id: templateId, status: 'approved' },
    });
    if (!template) throw new NotFoundException('Plantilla no encontrada');

    const existing = await this.saveRepo.findOne({
      where: { templateId, userId },
    });
    if (existing) {
      return { saved: true, saveCount: template.saveCount };
    }

    await this.saveRepo.save({ templateId, userId });
    await this.templateRepo.increment({ id: templateId }, 'saveCount', 1);
    const updated = await this.templateRepo.findOne({
      where: { id: templateId },
    });
    return { saved: true, saveCount: updated?.saveCount ?? template.saveCount + 1 };
  }

  async unsaveTemplate(
    templateId: string,
    userId: string,
  ): Promise<{ saved: boolean; saveCount: number }> {
    const template = await this.templateRepo.findOne({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('Plantilla no encontrada');

    const existing = await this.saveRepo.findOne({
      where: { templateId, userId },
    });
    if (!existing) {
      return { saved: false, saveCount: template.saveCount };
    }

    await this.saveRepo.delete({ templateId, userId });
    if (template.saveCount > 0) {
      await this.templateRepo.decrement({ id: templateId }, 'saveCount', 1);
    }
    const updated = await this.templateRepo.findOne({
      where: { id: templateId },
    });
    return {
      saved: false,
      saveCount: updated?.saveCount ?? Math.max(0, template.saveCount - 1),
    };
  }

  async useTemplate(
    templateId: string,
    userId: string,
  ): Promise<{ downloadUrl: string; downloadCount: number }> {
    const template = await this.templateRepo.findOne({
      where: { id: templateId, status: 'approved' },
    });
    if (!template) throw new NotFoundException('Plantilla no encontrada');
    if (!template.attachmentUrl) {
      throw new BadRequestException('Esta plantilla no tiene archivo adjunto');
    }

    await this.templateRepo.increment({ id: templateId }, 'downloadCount', 1);
    const updated = await this.templateRepo.findOne({
      where: { id: templateId },
    });
    return {
      downloadUrl: template.attachmentUrl,
      downloadCount: updated?.downloadCount ?? template.downloadCount + 1,
    };
  }

  async presignTemplateAttachment(
    userId: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    if (!ALLOWED_TEMPLATE_MIMES.has(contentType)) {
      throw new BadRequestException('Solo se permiten archivos PDF o DOCX');
    }
    const ext = TEMPLATE_CONTENT_TYPE_EXT[contentType] ?? 'bin';
    const key = `community/templates/${userId}/${randomUUID()}.${ext}`;
    const { uploadUrl, publicUrl } = await this.s3Service.getPresignedUploadUrl(
      key,
      contentType,
    );
    return { uploadUrl, publicUrl, key };
  }

  async approveTemplate(
    templateId: string,
  ): Promise<{ template: AcademicTemplateDto; xpAwarded: number }> {
    const template = await this.templateRepo.findOne({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('Plantilla no encontrada');
    if (template.status === 'approved') {
      const author = await this.userRepo.findOne({
        where: { id: template.userId },
      });
      if (!author) throw new NotFoundException();
      const dto = await this.toDto(template, author, false);
      return { template: dto, xpAwarded: 0 };
    }

    template.status = 'approved';
    template.approvedAt = new Date();
    template.rejectedAt = null;
    await this.templateRepo.save(template);

    const existingXp = await this.xpRepo.findOne({
      where: {
        userId: template.userId,
        source: 'community_template_approved',
        referenceId: template.id,
      },
    });
    let xpAwarded = 0;
    if (!existingXp) {
      await this.xpRepo.save({
        userId: template.userId,
        source: 'community_template_approved',
        amount: XP_TEMPLATE_APPROVED,
        referenceId: template.id,
      });
      xpAwarded = XP_TEMPLATE_APPROVED;
    }

    const author = await this.userRepo.findOne({
      where: { id: template.userId },
    });
    if (!author) throw new NotFoundException();
    const dto = await this.toDto(template, author, false);
    return { template: dto, xpAwarded };
  }
}
