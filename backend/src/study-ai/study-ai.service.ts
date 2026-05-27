import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import type { Response } from 'express';
import { Repository } from 'typeorm';
import { S3Service } from '../s3/s3.service';
import { Course } from '../study-university/entities/course.entity';
import { StudyUniversityService } from '../study-university/study-university.service';
import type { GenerateStudyContentDto, IngestStudyPdfDto, StudyChatDto } from './dto/study-ai.dto';
import { StudyPdfDocument } from './entities/study-pdf-document.entity';
import { FileingestClient } from './fileingest.client';

const PDF_CONTAINER_COURSE_CODE = 'STUDY_PDF_AI';
const PDF_CONTAINER_COURSE_NAME = 'Material PDF';

interface GeneratedFlashcards {
  flashcards: Array<{ question: string; answer: string; hint?: string }>;
}

interface GeneratedQuiz {
  quiz: {
    title: string;
    description?: string;
    questions: Array<{
      prompt: string;
      explanation?: string;
      options: Array<{ label: string; text: string; isCorrect: boolean }>;
    }>;
  };
}

interface GeneratedSummary {
  summary: string;
}

@Injectable()
export class StudyAiService {
  constructor(
    @InjectRepository(StudyPdfDocument)
    private readonly pdfDocRepo: Repository<StudyPdfDocument>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    private readonly s3Service: S3Service,
    private readonly fileingest: FileingestClient,
    private readonly studyUniversity: StudyUniversityService,
  ) {}

  async presignPdf(
    workspaceId: string,
    userId: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    await this.studyUniversity.getWorkspaceState(workspaceId, userId);
    if (contentType !== 'application/pdf') {
      throw new BadRequestException('Only application/pdf is supported');
    }
    const key = `study/${workspaceId}/${userId}/${randomUUID()}.pdf`;
    const { uploadUrl, publicUrl } = await this.s3Service.getPresignedUploadUrl(
      key,
      contentType,
    );
    return { uploadUrl, publicUrl, key };
  }

  private async ensurePdfContainerCourse(
    workspaceId: string,
    userId: string,
  ): Promise<string> {
    const existing = await this.courseRepo.findOne({
      where: { workspaceId, userId, code: PDF_CONTAINER_COURSE_CODE },
    });
    if (existing) return existing.id;

    const { course } = await this.studyUniversity.createCourse(workspaceId, userId, {
      name: PDF_CONTAINER_COURSE_NAME,
      code: PDF_CONTAINER_COURSE_CODE,
      colorToken: 'violet',
      schedules: [],
    });
    return course.id;
  }

  private async getOwnedDocument(
    workspaceId: string,
    userId: string,
    documentId: string,
  ): Promise<StudyPdfDocument> {
    const doc = await this.pdfDocRepo.findOne({
      where: { id: documentId, workspaceId, userId },
    });
    if (!doc) throw new NotFoundException('Study document not found');
    return doc;
  }

  async ingestDocument(
    workspaceId: string,
    userId: string,
    dto: IngestStudyPdfDto,
  ) {
    await this.studyUniversity.getWorkspaceState(workspaceId, userId);
    const courseId = await this.ensurePdfContainerCourse(workspaceId, userId);
    const fileingestDocumentId = randomUUID();

    const row = this.pdfDocRepo.create({
      workspaceId,
      userId,
      courseId,
      fileingestDocumentId,
      filename: dto.filename,
      s3Key: dto.s3Key,
      status: 'pending',
    });
    await this.pdfDocRepo.save(row);

    try {
      const result = await this.fileingest.ingest({
        documentId: fileingestDocumentId,
        workspaceId,
        userId,
        s3Key: dto.s3Key,
        filename: dto.filename,
        mimeType: dto.mimeType ?? 'application/pdf',
      });
      row.status = result.status;
      await this.pdfDocRepo.save(row);
      return {
        id: row.id,
        documentId: row.id,
        fileingestDocumentId: row.fileingestDocumentId,
        courseId: row.courseId,
        filename: row.filename,
        status: row.status,
      };
    } catch (err) {
      row.status = 'failed';
      await this.pdfDocRepo.save(row);
      throw err;
    }
  }

  async listDocuments(workspaceId: string, userId: string) {
    await this.studyUniversity.getWorkspaceState(workspaceId, userId);
    const docs = await this.pdfDocRepo.find({
      where: { workspaceId, userId },
      order: { createdAt: 'DESC' },
    });
    return docs.map((d) => ({
      id: d.id,
      documentId: d.id,
      fileingestDocumentId: d.fileingestDocumentId,
      courseId: d.courseId,
      filename: d.filename,
      status: d.status,
      summaryText: d.summaryText,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  }

  async getDocumentStatus(workspaceId: string, userId: string, documentId: string) {
    const doc = await this.getOwnedDocument(workspaceId, userId, documentId);
    const remote = await this.fileingest.getDocumentStatus(doc.fileingestDocumentId);
    if (remote.status !== doc.status) {
      doc.status = remote.status;
      await this.pdfDocRepo.save(doc);
    }
    return {
      id: doc.id,
      documentId: doc.id,
      fileingestDocumentId: doc.fileingestDocumentId,
      courseId: doc.courseId,
      filename: doc.filename,
      status: doc.status,
      totalChunks: remote.totalChunks,
      error: remote.error,
      summaryText: doc.summaryText,
    };
  }

  async streamChat(
    workspaceId: string,
    userId: string,
    dto: StudyChatDto,
    res: Response,
  ): Promise<void> {
    const doc = await this.getOwnedDocument(workspaceId, userId, dto.documentId);
    if (doc.status !== 'ready') {
      throw new BadRequestException('Document is not ready for chat yet');
    }
    await this.fileingest.chatStream(
      {
        workspaceId,
        contextDocumentIds: [doc.fileingestDocumentId],
        messages: dto.messages,
        ragEnabled: dto.ragEnabled !== false,
        topK: 6,
      },
      res,
    );
  }

  private buildGeneratePrompt(type: GenerateStudyContentDto['type'], filename: string): string {
    const base =
      `You are generating study material from the uploaded PDF "${filename}". ` +
      'Use ONLY the retrieved context. Respond with valid JSON only, no markdown fences.\n\n';

    if (type === 'flashcards') {
      return (
        base +
        'Return JSON: {"flashcards":[{"question":"...","answer":"...","hint":"..."}]}. ' +
        'Generate 8 to 12 flashcards in Spanish unless the document is in another language.'
      );
    }
    if (type === 'quiz') {
      return (
        base +
        'Return JSON: {"quiz":{"title":"...","description":"...","questions":[{"prompt":"...","explanation":"...","options":[{"label":"A","text":"...","isCorrect":true},{"label":"B","text":"...","isCorrect":false},{"label":"C","text":"...","isCorrect":false},{"label":"D","text":"...","isCorrect":false}]}]}}. ' +
        'Generate 5 multiple_choice questions in Spanish unless the document is in another language. Each question needs exactly 4 options and one correct.'
      );
    }
    return (
      base +
      'Return JSON: {"summary":"..."} where summary is markdown text (headings, bullet points) in Spanish unless the document is in another language.'
    );
  }

  private parseJsonFromAnswer<T>(answer: string): T {
    const trimmed = answer.trim();
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      const match = trimmed.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new BadRequestException('AI response was not valid JSON');
      }
      return JSON.parse(match[0]) as T;
    }
  }

  async generate(
    workspaceId: string,
    userId: string,
    dto: GenerateStudyContentDto,
  ) {
    const doc = await this.getOwnedDocument(workspaceId, userId, dto.documentId);
    if (doc.status !== 'ready') {
      throw new BadRequestException('Document is not ready for generation yet');
    }

    const question = this.buildGeneratePrompt(dto.type, doc.filename);
    const { answer } = await this.fileingest.query({
      workspaceId,
      documentIds: [doc.fileingestDocumentId],
      question,
      topK: 10,
    });

    if (dto.type === 'summary') {
      const parsed = this.parseJsonFromAnswer<GeneratedSummary>(answer);
      doc.summaryText = parsed.summary;
      await this.pdfDocRepo.save(doc);
      return { type: 'summary', summary: parsed.summary };
    }

    if (dto.type === 'flashcards') {
      const parsed = this.parseJsonFromAnswer<GeneratedFlashcards>(answer);
      const cards = parsed.flashcards ?? [];
      if (cards.length === 0) {
        throw new BadRequestException('No flashcards were generated');
      }
      const created: Awaited<ReturnType<StudyUniversityService['createFlashcard']>>[] = [];
      for (const card of cards) {
        const row = await this.studyUniversity.createFlashcard(
          workspaceId,
          userId,
          doc.courseId,
          {
            question: card.question,
            answer: card.answer,
            hint: card.hint,
          },
        );
        created.push(row);
      }
      return { type: 'flashcards', count: created.length, flashcards: created };
    }

    const parsed = this.parseJsonFromAnswer<GeneratedQuiz>(answer);
    const quizPayload = parsed.quiz;
    if (!quizPayload?.questions?.length) {
      throw new BadRequestException('No quiz questions were generated');
    }
    const quiz = await this.studyUniversity.createQuiz(workspaceId, userId, doc.courseId, {
      title: quizPayload.title || `Quiz: ${doc.filename}`,
      description: quizPayload.description,
      difficulty: 3,
      questions: quizPayload.questions.map((q) => ({
        type: 'multiple_choice' as const,
        prompt: q.prompt,
        explanation: q.explanation,
        options: q.options,
      })),
    });
    return { type: 'quiz', quiz };
  }
}
