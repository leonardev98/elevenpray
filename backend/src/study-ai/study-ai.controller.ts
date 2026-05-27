import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  GenerateStudyContentDto,
  IngestStudyPdfDto,
  PresignStudyPdfDto,
  StudyChatDto,
} from './dto/study-ai.dto';
import { StudyAiService } from './study-ai.service';

@Controller('study-university/workspaces/:workspaceId/study-ai')
@UseGuards(JwtAuthGuard)
export class StudyAiController {
  constructor(private readonly studyAiService: StudyAiService) {}

  @Post('documents/presign')
  presign(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: PresignStudyPdfDto,
  ) {
    return this.studyAiService.presignPdf(workspaceId, userId, dto.contentType);
  }

  @Post('documents/ingest')
  ingest(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: IngestStudyPdfDto,
  ) {
    return this.studyAiService.ingestDocument(workspaceId, userId, dto);
  }

  @Get('documents')
  list(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.studyAiService.listDocuments(workspaceId, userId);
  }

  @Get('documents/:documentId/status')
  status(
    @Param('workspaceId') workspaceId: string,
    @Param('documentId') documentId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.studyAiService.getDocumentStatus(workspaceId, userId, documentId);
  }

  @Post('chat')
  async chat(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: StudyChatDto,
    @Res() res: Response,
  ) {
    await this.studyAiService.streamChat(workspaceId, userId, dto, res);
  }

  @Post('generate')
  generate(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: GenerateStudyContentDto,
  ) {
    return this.studyAiService.generate(workspaceId, userId, dto);
  }
}
