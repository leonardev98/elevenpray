import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { PublicUser } from '../auth/auth.service';
import { CommunityTemplatesService } from './community-templates.service';
import {
  CreateAcademicTemplateDto,
  PresignTemplateAttachmentDto,
} from './dto/community-template.dto';

@Controller('community/templates')
@UseGuards(JwtAuthGuard)
export class CommunityTemplatesController {
  constructor(private readonly templatesService: CommunityTemplatesService) {}

  private ensureAdmin(user: PublicUser): void {
    if (user.role !== 'platform_admin') {
      throw new ForbiddenException('Admin role required');
    }
  }

  @Get()
  listApproved(
    @CurrentUser('id') userId: string,
    @Query('career') career?: string,
    @Query('types') types?: string,
    @Query('universityFirst') universityFirst?: string,
  ) {
    return this.templatesService.listApproved(userId, {
      career,
      types,
      universityFirst: universityFirst === 'true' || universityFirst === '1',
    });
  }

  @Get('mine')
  listMine(@CurrentUser('id') userId: string) {
    return this.templatesService.listMine(userId);
  }

  @Get('saved')
  listSaved(@CurrentUser('id') userId: string) {
    return this.templatesService.listSaved(userId);
  }

  @Get('contributors/top')
  topContributors(@Query('limit') limit?: string) {
    return this.templatesService.topContributors(
      limit ? Math.min(Number(limit), 10) : 3,
    );
  }

  @Post('attachments/presign')
  presignAttachment(
    @Body() dto: PresignTemplateAttachmentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.templatesService.presignTemplateAttachment(
      userId,
      dto.contentType,
    );
  }

  @Post()
  create(
    @Body() dto: CreateAcademicTemplateDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.templatesService.create(userId, dto);
  }

  @Post(':id/save')
  saveTemplate(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.templatesService.saveTemplate(id, userId);
  }

  @Delete(':id/save')
  unsaveTemplate(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.templatesService.unsaveTemplate(id, userId);
  }

  @Post(':id/use')
  useTemplate(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.templatesService.useTemplate(id, userId);
  }

  @Patch(':id/approve')
  approveTemplate(
    @Param('id') id: string,
    @CurrentUser() user: PublicUser,
  ) {
    this.ensureAdmin(user);
    return this.templatesService.approveTemplate(id);
  }
}
