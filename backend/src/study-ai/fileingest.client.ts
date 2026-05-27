import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { Readable } from 'stream';

export interface FileingestIngestPayload {
  documentId?: string;
  workspaceId: string;
  userId: string;
  s3Key: string;
  filename: string;
  mimeType: string;
}

export interface FileingestIngestResult {
  documentId: string;
  status: string;
}

export interface FileingestDocumentStatus {
  id: string;
  workspaceId: string;
  userId: string;
  filename: string;
  mimeType: string;
  status: string;
  totalChunks?: number | null;
  error?: string | null;
}

export interface FileingestQueryPayload {
  workspaceId: string;
  documentIds?: string[];
  question: string;
  topK?: number;
}

export interface FileingestQueryResult {
  answer: string;
  citations?: unknown[];
}

export interface FileingestChatPayload {
  workspaceId: string;
  contextDocumentIds?: string[];
  messages: { role: string; content: string }[];
  ragEnabled: boolean;
  topK?: number;
}

@Injectable()
export class FileingestClient {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = (this.config.get<string>('FILEINGEST_BASE_URL') ?? '').replace(/\/$/, '');
    this.token = this.config.get<string>('FILEINGEST_INTERNAL_TOKEN') ?? '';
  }

  private headers(json = true): Record<string, string> {
    const h: Record<string, string> = {
      'X-Internal-Token': this.token,
    };
    if (json) h['Content-Type'] = 'application/json';
    return h;
  }

  private ensureConfigured(): void {
    if (!this.baseUrl || !this.token) {
      throw new ServiceUnavailableException(
        'Fileingest is not configured (FILEINGEST_BASE_URL / FILEINGEST_INTERNAL_TOKEN)',
      );
    }
  }

  async ingest(payload: FileingestIngestPayload): Promise<FileingestIngestResult> {
    this.ensureConfigured();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10 * 60 * 1000);
    try {
      const res = await fetch(`${this.baseUrl}/v1/ingest`, {
        method: 'POST',
        headers: this.headers(),
        body: JSON.stringify({
          documentId: payload.documentId,
          workspaceId: payload.workspaceId,
          userId: payload.userId,
          source: { s3Key: payload.s3Key },
          mimeType: payload.mimeType,
          filename: payload.filename,
        }),
        signal: controller.signal,
      });
      const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        throw new InternalServerErrorException(
          String(body.error ?? `Fileingest ingest failed (${res.status})`),
        );
      }
      return {
        documentId: String(body.documentId),
        status: String(body.status ?? 'ready'),
      };
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      const message = err instanceof Error ? err.message : 'Fileingest ingest error';
      throw new ServiceUnavailableException(message);
    } finally {
      clearTimeout(timeout);
    }
  }

  async getDocumentStatus(fileingestDocumentId: string): Promise<FileingestDocumentStatus> {
    this.ensureConfigured();
    const res = await fetch(`${this.baseUrl}/v1/documents/${fileingestDocumentId}/status`, {
      headers: this.headers(false),
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      throw new InternalServerErrorException(
        String(body.error ?? `Fileingest status failed (${res.status})`),
      );
    }
    return {
      id: String(body.id),
      workspaceId: String(body.workspaceId),
      userId: String(body.userId),
      filename: String(body.filename),
      mimeType: String(body.mimeType),
      status: String(body.status),
      totalChunks: (body.totalChunks as number | null) ?? null,
      error: (body.error as string | null) ?? null,
    };
  }

  async query(payload: FileingestQueryPayload): Promise<FileingestQueryResult> {
    this.ensureConfigured();
    const res = await fetch(`${this.baseUrl}/v1/query`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({
        workspaceId: payload.workspaceId,
        documentIds: payload.documentIds,
        question: payload.question,
        topK: payload.topK ?? 8,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      throw new InternalServerErrorException(
        String(body.error ?? `Fileingest query failed (${res.status})`),
      );
    }
    return {
      answer: String(body.answer ?? ''),
      citations: body.citations as unknown[] | undefined,
    };
  }

  async chatStream(payload: FileingestChatPayload, res: Response): Promise<void> {
    this.ensureConfigured();
    const upstream = await fetch(`${this.baseUrl}/v1/chat`, {
      method: 'POST',
      headers: {
        ...this.headers(),
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      res.status(upstream.status).json({
        error: errText || `Fileingest chat failed (${upstream.status})`,
      });
      return;
    }

    if (!upstream.body) {
      throw new InternalServerErrorException('Fileingest chat returned empty body');
    }

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const nodeStream = Readable.fromWeb(upstream.body as import('stream/web').ReadableStream);
    await new Promise<void>((resolve, reject) => {
      nodeStream.on('data', (chunk: Buffer) => res.write(chunk));
      nodeStream.on('end', () => {
        res.end();
        resolve();
      });
      nodeStream.on('error', reject);
    });
  }
}
