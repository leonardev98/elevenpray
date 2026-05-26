import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { CommunityPost } from './entities/community-post.entity';
import { CommunityPostLike } from './entities/community-post-like.entity';
import { CommunityPostComment } from './entities/community-post-comment.entity';
import { CommunityQuestion } from './entities/community-question.entity';
import { CommunityQuestionAnswer } from './entities/community-question-answer.entity';
import { CommunityAnswerVote } from './entities/community-answer-vote.entity';
import { CommunityReport } from './entities/community-report.entity';
import { User } from '../users/entities/user.entity';
import {
  CreatePostDto,
  UpdatePostDto,
} from './dto/create-post.dto';
import {
  CreateCommentDto,
  UpdateCommentDto,
} from './dto/create-comment.dto';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
} from './dto/create-question.dto';
import {
  CreateAnswerDto,
  UpdateAnswerDto,
} from './dto/create-answer.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { S3Service } from '../s3/s3.service';

export interface AuthorDto {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface CommunityPostDto {
  id: string;
  type: string;
  title: string;
  body: string | null;
  course: string | null;
  university: string | null;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentSizeBytes: number | null;
  attachmentMime: string | null;
  likeCount: number;
  commentCount: number;
  liked: boolean;
  createdAt: string;
  updatedAt: string;
  author: AuthorDto;
}

export interface CommunityCommentDto {
  id: string;
  postId: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: AuthorDto;
  replies: CommunityCommentDto[];
}

export interface CommunityAnswerDto {
  id: string;
  questionId: string;
  parentId: string | null;
  body: string;
  upvoteCount: number;
  upvoted: boolean;
  createdAt: string;
  updatedAt: string;
  author: AuthorDto;
  replies: CommunityAnswerDto[];
}

export interface CommunityQuestionDto {
  id: string;
  title: string;
  body: string | null;
  course: string | null;
  university: string | null;
  viewCount: number;
  answerCount: number;
  acceptedAnswerId: string | null;
  createdAt: string;
  updatedAt: string;
  author: AuthorDto;
  answers?: CommunityAnswerDto[];
}

const CONTENT_TYPE_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityPost)
    private readonly postRepo: Repository<CommunityPost>,
    @InjectRepository(CommunityPostLike)
    private readonly postLikeRepo: Repository<CommunityPostLike>,
    @InjectRepository(CommunityPostComment)
    private readonly postCommentRepo: Repository<CommunityPostComment>,
    @InjectRepository(CommunityQuestion)
    private readonly questionRepo: Repository<CommunityQuestion>,
    @InjectRepository(CommunityQuestionAnswer)
    private readonly answerRepo: Repository<CommunityQuestionAnswer>,
    @InjectRepository(CommunityAnswerVote)
    private readonly answerVoteRepo: Repository<CommunityAnswerVote>,
    @InjectRepository(CommunityReport)
    private readonly reportRepo: Repository<CommunityReport>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
  ) {}

  // ---------- helpers ----------

  private toAuthor(user: User | null | undefined, fallbackId: string): AuthorDto {
    if (!user) {
      return { id: fallbackId, name: 'Usuario eliminado', avatarUrl: null };
    }
    return { id: user.id, name: user.name, avatarUrl: user.avatarUrl };
  }

  private async loadAuthors(userIds: string[]): Promise<Map<string, User>> {
    const unique = Array.from(new Set(userIds.filter(Boolean)));
    if (unique.length === 0) return new Map();
    const users = await this.userRepo.find({ where: { id: In(unique) } });
    return new Map(users.map((u) => [u.id, u]));
  }

  // ---------- posts ----------

  async listPosts(
    userId: string,
    opts: { limit?: number; offset?: number; university?: string; course?: string } = {},
  ): Promise<CommunityPostDto[]> {
    const limit = Math.min(opts.limit ?? 50, 100);
    const offset = Math.max(opts.offset ?? 0, 0);
    const qb = this.postRepo
      .createQueryBuilder('post')
      .orderBy('post.created_at', 'DESC')
      .skip(offset)
      .take(limit);
    if (opts.university) qb.andWhere('post.university = :u', { u: opts.university });
    if (opts.course) qb.andWhere('post.course = :c', { c: opts.course });
    const posts = await qb.getMany();
    if (posts.length === 0) return [];

    const postIds = posts.map((p) => p.id);
    const [authorsMap, likes] = await Promise.all([
      this.loadAuthors(posts.map((p) => p.userId)),
      this.postLikeRepo.find({ where: { userId, postId: In(postIds) } }),
    ]);
    const likedSet = new Set(likes.map((l) => l.postId));

    return posts.map((p) => this.toPostDto(p, authorsMap.get(p.userId), likedSet.has(p.id)));
  }

  private toPostDto(
    p: CommunityPost,
    author: User | undefined,
    liked: boolean,
  ): CommunityPostDto {
    return {
      id: p.id,
      type: p.type,
      title: p.title,
      body: p.body,
      course: p.course,
      university: p.university,
      attachmentUrl: p.attachmentUrl,
      attachmentName: p.attachmentName,
      attachmentSizeBytes: p.attachmentSizeBytes ? Number(p.attachmentSizeBytes) : null,
      attachmentMime: p.attachmentMime,
      likeCount: p.likeCount,
      commentCount: p.commentCount,
      liked,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      author: this.toAuthor(author, p.userId),
    };
  }

  async getPost(id: string, userId: string): Promise<CommunityPostDto> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post no encontrado');
    const [author, like] = await Promise.all([
      this.userRepo.findOne({ where: { id: post.userId } }),
      this.postLikeRepo.findOne({ where: { postId: id, userId } }),
    ]);
    return this.toPostDto(post, author ?? undefined, !!like);
  }

  async createPost(userId: string, dto: CreatePostDto): Promise<CommunityPostDto> {
    const post = this.postRepo.create({
      userId,
      type: dto.type as CommunityPost['type'],
      title: dto.title,
      body: dto.body ?? null,
      course: dto.course ?? null,
      university: dto.university ?? null,
      attachmentUrl: dto.attachmentUrl ?? null,
      attachmentName: dto.attachmentName ?? null,
      attachmentSizeBytes: dto.attachmentSizeBytes
        ? String(dto.attachmentSizeBytes)
        : null,
      attachmentMime: dto.attachmentMime ?? null,
    });
    const [saved, author] = await Promise.all([
      this.postRepo.save(post),
      this.userRepo.findOne({ where: { id: userId } }),
    ]);
    return this.toPostDto(saved, author ?? undefined, false);
  }

  async updatePost(
    id: string,
    userId: string,
    dto: UpdatePostDto,
  ): Promise<CommunityPostDto> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post no encontrado');
    if (post.userId !== userId) throw new ForbiddenException();
    if (dto.title !== undefined) post.title = dto.title;
    if (dto.body !== undefined) post.body = dto.body;
    if (dto.course !== undefined) post.course = dto.course;
    if (dto.university !== undefined) post.university = dto.university;
    const [saved, author, like] = await Promise.all([
      this.postRepo.save(post),
      this.userRepo.findOne({ where: { id: post.userId } }),
      this.postLikeRepo.findOne({ where: { postId: id, userId } }),
    ]);
    return this.toPostDto(saved, author ?? undefined, !!like);
  }

  async deletePost(id: string, userId: string): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post no encontrado');
    if (post.userId !== userId) throw new ForbiddenException();
    await this.postRepo.delete(id);
  }

  // ---------- likes ----------

  async likePost(postId: string, userId: string): Promise<{ liked: true; likeCount: number }> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post no encontrado');
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(CommunityPostLike, {
        where: { postId, userId },
      });
      if (existing) {
        const fresh = await manager.findOne(CommunityPost, { where: { id: postId } });
        return { liked: true, likeCount: fresh?.likeCount ?? post.likeCount };
      }
      await manager.insert(CommunityPostLike, { postId, userId });
      await manager.increment(CommunityPost, { id: postId }, 'likeCount', 1);
      const fresh = await manager.findOne(CommunityPost, { where: { id: postId } });
      return { liked: true, likeCount: fresh?.likeCount ?? post.likeCount + 1 };
    });
  }

  async unlikePost(postId: string, userId: string): Promise<{ liked: false; likeCount: number }> {
    const post = await this.postRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post no encontrado');
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(CommunityPostLike, {
        where: { postId, userId },
      });
      if (!existing) {
        return { liked: false, likeCount: post.likeCount };
      }
      await manager.delete(CommunityPostLike, { postId, userId });
      await manager.decrement(CommunityPost, { id: postId }, 'likeCount', 1);
      const fresh = await manager.findOne(CommunityPost, { where: { id: postId } });
      return { liked: false, likeCount: fresh?.likeCount ?? Math.max(post.likeCount - 1, 0) };
    });
  }

  // ---------- comments ----------

  async listComments(postId: string): Promise<CommunityCommentDto[]> {
    // Skip existence check on parent post — if there are no comments, return empty.
    // El controlador valida que el id sea UUID, y una pregunta inexistente con UUID válido
    // simplemente devuelve []. Esto evita un round-trip extra.
    const comments = await this.postCommentRepo.find({
      where: { postId },
      order: { createdAt: 'ASC' },
    });
    if (comments.length === 0) return [];
    const authors = await this.loadAuthors(comments.map((c) => c.userId));
    const map = new Map<string, CommunityCommentDto>();
    const roots: CommunityCommentDto[] = [];
    for (const c of comments) {
      const dto: CommunityCommentDto = {
        id: c.id,
        postId: c.postId,
        parentId: c.parentId,
        body: c.body,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        author: this.toAuthor(authors.get(c.userId), c.userId),
        replies: [],
      };
      map.set(c.id, dto);
    }
    for (const c of comments) {
      const dto = map.get(c.id)!;
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.replies.push(dto);
      } else {
        roots.push(dto);
      }
    }
    return roots;
  }

  async createComment(
    postId: string,
    userId: string,
    dto: CreateCommentDto,
  ): Promise<CommunityCommentDto> {
    // Validación combinada en una sola query si hay parentId.
    // Si no hay parentId verificamos que el post exista a través del INSERT
    // (la FK fallará si no existe) — pero hacemos una validación rápida.
    if (dto.parentId) {
      const parent = await this.postCommentRepo.findOne({
        where: { id: dto.parentId },
        select: ['id', 'postId', 'parentId'],
      });
      if (!parent || parent.postId !== postId) {
        throw new BadRequestException('Comentario padre invalido');
      }
      if (parent.parentId) {
        throw new BadRequestException('Solo se permite un nivel de respuesta');
      }
    }
    const [created, author] = await Promise.all([
      this.dataSource.transaction(async (manager) => {
        const comment = manager.create(CommunityPostComment, {
          postId,
          userId,
          parentId: dto.parentId ?? null,
          body: dto.body,
        });
        const saved = await manager.save(comment);
        await manager.increment(CommunityPost, { id: postId }, 'commentCount', 1);
        return saved;
      }),
      this.userRepo.findOne({ where: { id: userId } }),
    ]);
    return {
      id: created.id,
      postId: created.postId,
      parentId: created.parentId,
      body: created.body,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
      author: this.toAuthor(author ?? undefined, userId),
      replies: [],
    };
  }

  async updateComment(
    id: string,
    userId: string,
    dto: UpdateCommentDto,
  ): Promise<CommunityCommentDto> {
    const comment = await this.postCommentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comentario no encontrado');
    if (comment.userId !== userId) throw new ForbiddenException();
    comment.body = dto.body;
    await this.postCommentRepo.save(comment);
    const author = await this.userRepo.findOne({ where: { id: userId } });
    return {
      id: comment.id,
      postId: comment.postId,
      parentId: comment.parentId,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      author: this.toAuthor(author ?? undefined, userId),
      replies: [],
    };
  }

  async deleteComment(id: string, userId: string): Promise<void> {
    const comment = await this.postCommentRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comentario no encontrado');
    if (comment.userId !== userId) throw new ForbiddenException();
    await this.dataSource.transaction(async (manager) => {
      // Cuenta cuántos comments (incluyendo replies) se borrarán para ajustar el counter
      const descendants = await manager.count(CommunityPostComment, {
        where: { parentId: id },
      });
      const total = 1 + descendants;
      await manager.delete(CommunityPostComment, id);
      await manager.decrement(
        CommunityPost,
        { id: comment.postId },
        'commentCount',
        total,
      );
    });
  }

  // ---------- attachments (S3) ----------

  async presignAttachment(
    userId: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
    const ext = CONTENT_TYPE_EXT[contentType] ?? 'bin';
    const key = `community/${userId}/${randomUUID()}.${ext}`;
    const { uploadUrl, publicUrl } = await this.s3Service.getPresignedUploadUrl(
      key,
      contentType,
    );
    return { uploadUrl, publicUrl, key };
  }

  // ---------- questions ----------

  async listQuestions(
    userId: string,
    opts: {
      limit?: number;
      offset?: number;
      university?: string;
      course?: string;
      filter?: 'all' | 'unanswered' | 'top' | 'week';
    } = {},
  ): Promise<CommunityQuestionDto[]> {
    const limit = Math.min(opts.limit ?? 50, 100);
    const offset = Math.max(opts.offset ?? 0, 0);
    const qb = this.questionRepo
      .createQueryBuilder('q')
      .skip(offset)
      .take(limit);
    if (opts.university) qb.andWhere('q.university = :u', { u: opts.university });
    if (opts.course) qb.andWhere('q.course = :c', { c: opts.course });

    switch (opts.filter) {
      case 'unanswered':
        qb.andWhere('q.answer_count = 0').orderBy('q.created_at', 'DESC');
        break;
      case 'top':
        qb.orderBy('q.answer_count', 'DESC').addOrderBy('q.view_count', 'DESC');
        break;
      case 'week':
        qb.andWhere(`q.created_at >= NOW() - INTERVAL '7 days'`).orderBy(
          'q.created_at',
          'DESC',
        );
        break;
      default:
        qb.orderBy('q.created_at', 'DESC');
    }
    const questions = await qb.getMany();
    if (questions.length === 0) return [];
    const authors = await this.loadAuthors(questions.map((q) => q.userId));
    return questions.map((q) => this.toQuestionDto(q, authors.get(q.userId)));
  }

  private toQuestionDto(
    q: CommunityQuestion,
    author: User | undefined,
    answers?: CommunityAnswerDto[],
  ): CommunityQuestionDto {
    return {
      id: q.id,
      title: q.title,
      body: q.body,
      course: q.course,
      university: q.university,
      viewCount: q.viewCount,
      answerCount: q.answerCount,
      acceptedAnswerId: q.acceptedAnswerId,
      createdAt: q.createdAt.toISOString(),
      updatedAt: q.updatedAt.toISOString(),
      author: this.toAuthor(author, q.userId),
      ...(answers ? { answers } : {}),
    };
  }

  async getQuestion(id: string, userId: string): Promise<CommunityQuestionDto> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Pregunta no encontrada');
    const answersPromise = this.answerRepo.find({
      where: { questionId: id },
      order: { createdAt: 'ASC' },
    });
    // Incrementa view_count en paralelo sin esperar (fire-and-forget local).
    let viewBoost = 0;
    if (question.userId !== userId) {
      viewBoost = 1;
      // No await: la operación corre en paralelo y el resultado optimista se
      // refleja sumando viewBoost al valor leído.
      void this.questionRepo.increment({ id }, 'viewCount', 1).catch(() => undefined);
    }
    const answers = await answersPromise;
    const authorIds = [question.userId, ...answers.map((a) => a.userId)];
    const [authors, votes] = await Promise.all([
      this.loadAuthors(authorIds),
      answers.length > 0
        ? this.answerVoteRepo.find({
            where: { userId, answerId: In(answers.map((a) => a.id)) },
          })
        : Promise.resolve([] as CommunityAnswerVote[]),
    ]);
    question.viewCount += viewBoost;
    const votedSet = new Set(votes.map((v) => v.answerId));

    const map = new Map<string, CommunityAnswerDto>();
    const roots: CommunityAnswerDto[] = [];
    for (const a of answers) {
      const dto: CommunityAnswerDto = {
        id: a.id,
        questionId: a.questionId,
        parentId: a.parentId,
        body: a.body,
        upvoteCount: a.upvoteCount,
        upvoted: votedSet.has(a.id),
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
        author: this.toAuthor(authors.get(a.userId), a.userId),
        replies: [],
      };
      map.set(a.id, dto);
    }
    for (const a of answers) {
      const dto = map.get(a.id)!;
      if (a.parentId && map.has(a.parentId)) {
        map.get(a.parentId)!.replies.push(dto);
      } else {
        roots.push(dto);
      }
    }
    return this.toQuestionDto(question, authors.get(question.userId), roots);
  }

  async createQuestion(
    userId: string,
    dto: CreateQuestionDto,
  ): Promise<CommunityQuestionDto> {
    const question = this.questionRepo.create({
      userId,
      title: dto.title,
      body: dto.body ?? null,
      course: dto.course ?? null,
      university: dto.university ?? null,
    });
    const saved = await this.questionRepo.save(question);
    const author = await this.userRepo.findOne({ where: { id: userId } });
    return this.toQuestionDto(saved, author ?? undefined, []);
  }

  async updateQuestion(
    id: string,
    userId: string,
    dto: UpdateQuestionDto,
  ): Promise<CommunityQuestionDto> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Pregunta no encontrada');
    if (question.userId !== userId) throw new ForbiddenException();
    if (dto.title !== undefined) question.title = dto.title;
    if (dto.body !== undefined) question.body = dto.body;
    if (dto.course !== undefined) question.course = dto.course;
    if (dto.university !== undefined) question.university = dto.university;
    await this.questionRepo.save(question);
    const author = await this.userRepo.findOne({ where: { id: userId } });
    return this.toQuestionDto(question, author ?? undefined);
  }

  async deleteQuestion(id: string, userId: string): Promise<void> {
    const question = await this.questionRepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Pregunta no encontrada');
    if (question.userId !== userId) throw new ForbiddenException();
    await this.questionRepo.delete(id);
  }

  // ---------- answers ----------

  async createAnswer(
    questionId: string,
    userId: string,
    dto: CreateAnswerDto,
  ): Promise<CommunityAnswerDto> {
    if (dto.parentId) {
      const parent = await this.answerRepo.findOne({
        where: { id: dto.parentId },
        select: ['id', 'questionId', 'parentId'],
      });
      if (!parent || parent.questionId !== questionId) {
        throw new BadRequestException('Respuesta padre invalida');
      }
      if (parent.parentId) {
        throw new BadRequestException('Solo se permite un nivel de respuesta');
      }
    }
    const [created, author] = await Promise.all([
      this.dataSource.transaction(async (manager) => {
        const answer = manager.create(CommunityQuestionAnswer, {
          questionId,
          userId,
          parentId: dto.parentId ?? null,
          body: dto.body,
        });
        const saved = await manager.save(answer);
        await manager.increment(
          CommunityQuestion,
          { id: questionId },
          'answerCount',
          1,
        );
        return saved;
      }),
      this.userRepo.findOne({ where: { id: userId } }),
    ]);
    return {
      id: created.id,
      questionId: created.questionId,
      parentId: created.parentId,
      body: created.body,
      upvoteCount: created.upvoteCount,
      upvoted: false,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
      author: this.toAuthor(author ?? undefined, userId),
      replies: [],
    };
  }

  async updateAnswer(
    id: string,
    userId: string,
    dto: UpdateAnswerDto,
  ): Promise<CommunityAnswerDto> {
    const answer = await this.answerRepo.findOne({ where: { id } });
    if (!answer) throw new NotFoundException('Respuesta no encontrada');
    if (answer.userId !== userId) throw new ForbiddenException();
    answer.body = dto.body;
    await this.answerRepo.save(answer);
    const author = await this.userRepo.findOne({ where: { id: userId } });
    return {
      id: answer.id,
      questionId: answer.questionId,
      parentId: answer.parentId,
      body: answer.body,
      upvoteCount: answer.upvoteCount,
      upvoted: !!(await this.answerVoteRepo.findOne({
        where: { answerId: id, userId },
      })),
      createdAt: answer.createdAt.toISOString(),
      updatedAt: answer.updatedAt.toISOString(),
      author: this.toAuthor(author ?? undefined, userId),
      replies: [],
    };
  }

  async deleteAnswer(id: string, userId: string): Promise<void> {
    const answer = await this.answerRepo.findOne({ where: { id } });
    if (!answer) throw new NotFoundException('Respuesta no encontrada');
    if (answer.userId !== userId) throw new ForbiddenException();
    await this.dataSource.transaction(async (manager) => {
      const descendants = await manager.count(CommunityQuestionAnswer, {
        where: { parentId: id },
      });
      const total = 1 + descendants;
      await manager.delete(CommunityQuestionAnswer, id);
      await manager.decrement(
        CommunityQuestion,
        { id: answer.questionId },
        'answerCount',
        total,
      );
      // Clear accepted_answer_id if it pointed to this answer
      await manager.update(
        CommunityQuestion,
        { id: answer.questionId, acceptedAnswerId: id },
        { acceptedAnswerId: null },
      );
    });
  }

  async voteAnswer(
    answerId: string,
    userId: string,
  ): Promise<{ upvoted: true; upvoteCount: number }> {
    const answer = await this.answerRepo.findOne({ where: { id: answerId } });
    if (!answer) throw new NotFoundException('Respuesta no encontrada');
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(CommunityAnswerVote, {
        where: { answerId, userId },
      });
      if (existing) {
        const fresh = await manager.findOne(CommunityQuestionAnswer, {
          where: { id: answerId },
        });
        return { upvoted: true, upvoteCount: fresh?.upvoteCount ?? answer.upvoteCount };
      }
      await manager.insert(CommunityAnswerVote, { answerId, userId });
      await manager.increment(
        CommunityQuestionAnswer,
        { id: answerId },
        'upvoteCount',
        1,
      );
      const fresh = await manager.findOne(CommunityQuestionAnswer, {
        where: { id: answerId },
      });
      return {
        upvoted: true,
        upvoteCount: fresh?.upvoteCount ?? answer.upvoteCount + 1,
      };
    });
  }

  async unvoteAnswer(
    answerId: string,
    userId: string,
  ): Promise<{ upvoted: false; upvoteCount: number }> {
    const answer = await this.answerRepo.findOne({ where: { id: answerId } });
    if (!answer) throw new NotFoundException('Respuesta no encontrada');
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(CommunityAnswerVote, {
        where: { answerId, userId },
      });
      if (!existing) {
        return { upvoted: false, upvoteCount: answer.upvoteCount };
      }
      await manager.delete(CommunityAnswerVote, { answerId, userId });
      await manager.decrement(
        CommunityQuestionAnswer,
        { id: answerId },
        'upvoteCount',
        1,
      );
      const fresh = await manager.findOne(CommunityQuestionAnswer, {
        where: { id: answerId },
      });
      return {
        upvoted: false,
        upvoteCount: fresh?.upvoteCount ?? Math.max(answer.upvoteCount - 1, 0),
      };
    });
  }

  async acceptAnswer(
    questionId: string,
    answerId: string,
    userId: string,
  ): Promise<{ acceptedAnswerId: string }> {
    const [question, answer] = await Promise.all([
      this.questionRepo.findOne({
        where: { id: questionId },
        select: ['id', 'userId'],
      }),
      this.answerRepo.findOne({
        where: { id: answerId },
        select: ['id', 'questionId'],
      }),
    ]);
    if (!question) throw new NotFoundException('Pregunta no encontrada');
    if (question.userId !== userId) throw new ForbiddenException();
    if (!answer || answer.questionId !== questionId) {
      throw new BadRequestException('Respuesta no pertenece a esta pregunta');
    }
    await this.questionRepo.update({ id: questionId }, { acceptedAnswerId: answerId });
    return { acceptedAnswerId: answerId };
  }

  // ---------- reports ----------

  async createReport(userId: string, dto: CreateReportDto): Promise<{ id: string }> {
    await this.assertTargetExists(dto.targetType, dto.targetId);
    const saved = await this.reportRepo.save(
      this.reportRepo.create({
        userId,
        targetType: dto.targetType as 'post' | 'question' | 'answer' | 'comment',
        targetId: dto.targetId,
        reason: dto.reason,
        details: dto.details ?? null,
      }),
    );
    return { id: saved.id };
  }

  private async assertTargetExists(
    targetType: string,
    targetId: string,
  ): Promise<void> {
    let exists = false;
    switch (targetType) {
      case 'post':
        exists = !!(await this.postRepo.findOne({ where: { id: targetId } }));
        break;
      case 'question':
        exists = !!(await this.questionRepo.findOne({ where: { id: targetId } }));
        break;
      case 'answer':
        exists = !!(await this.answerRepo.findOne({ where: { id: targetId } }));
        break;
      case 'comment':
        exists = !!(await this.postCommentRepo.findOne({ where: { id: targetId } }));
        break;
    }
    if (!exists) throw new NotFoundException('Recurso a reportar no encontrado');
  }
}
