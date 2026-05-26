"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  MessageCircle,
  Send,
  ThumbsUp,
} from "lucide-react";
import { useAuth } from "@/app/providers/auth-provider";
import {
  acceptAnswer,
  createAnswer,
  deleteAnswer,
  getQuestion,
  unvoteAnswer,
  updateAnswer,
  voteAnswer,
  type CommunityAnswerDto,
  type CommunityQuestionDto,
} from "@/app/lib/community-api";
import { UserAvatar } from "../UserAvatar";
import { PostActionsMenu } from "../PostActionsMenu";
import { ReportModal } from "../ReportModal";
import {
  authorColorClass,
  formatTimeAgo,
  getAuthorInitial,
} from "../../community-utils";
import { cn } from "@/lib/utils";

interface QuestionCardProps {
  question: CommunityQuestionDto;
  currentUserId: string | null;
  onEdit: (q: CommunityQuestionDto) => void;
  onDelete: (q: CommunityQuestionDto) => void;
}

function QuestionCardImpl({
  question,
  currentUserId,
  onEdit,
  onDelete,
}: QuestionCardProps) {
  const { token } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<CommunityAnswerDto[]>(question.answers ?? []);
  const [acceptedAnswerId, setAcceptedAnswerId] = useState<string | null>(
    question.acceptedAnswerId,
  );
  const [viewCount, setViewCount] = useState(question.viewCount);
  const [answerCount, setAnswerCount] = useState(question.answerCount);
  const [newAnswer, setNewAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const isAuthor = currentUserId === question.author.id;

  async function toggle() {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setExpanded(true);
    if (loaded || !token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getQuestion(token, question.id);
      setAnswers(data.answers ?? []);
      setAcceptedAnswerId(data.acceptedAnswerId);
      setViewCount(data.viewCount);
      setAnswerCount(data.answerCount);
      setLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar respuestas");
    } finally {
      setLoading(false);
    }
  }

  async function handleNewAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    const body = newAnswer.trim();
    if (!body) return;
    setSubmitting(true);
    try {
      const created = await createAnswer(token, question.id, { body });
      setAnswers((curr) => [...curr, created]);
      setAnswerCount((c) => c + 1);
      setNewAnswer("");
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al responder");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: string, body: string) {
    if (!token) return;
    const created = await createAnswer(token, question.id, { body, parentId });
    setAnswers((curr) =>
      curr.map((a) =>
        a.id === parentId ? { ...a, replies: [...a.replies, created] } : a,
      ),
    );
    setAnswerCount((c) => c + 1);
  }

  async function handleVote(answerId: string, currentlyUpvoted: boolean) {
    if (!token) return;
    try {
      const res = currentlyUpvoted
        ? await unvoteAnswer(token, answerId)
        : await voteAnswer(token, answerId);
      setAnswers((curr) =>
        curr.map((a) => {
          if (a.id === answerId) {
            return { ...a, upvoted: res.upvoted, upvoteCount: res.upvoteCount };
          }
          return {
            ...a,
            replies: a.replies.map((r) =>
              r.id === answerId
                ? { ...r, upvoted: res.upvoted, upvoteCount: res.upvoteCount }
                : r,
            ),
          };
        }),
      );
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al votar");
    }
  }

  async function handleAccept(answerId: string) {
    if (!token) return;
    try {
      await acceptAnswer(token, question.id, answerId);
      setAcceptedAnswerId(answerId);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al aceptar respuesta");
    }
  }

  async function handleEditAnswer(answerId: string, body: string) {
    if (!token) return;
    const updated = await updateAnswer(token, answerId, body);
    setAnswers((curr) =>
      curr.map((a) => {
        if (a.id === answerId) return { ...updated, replies: a.replies };
        return {
          ...a,
          replies: a.replies.map((r) =>
            r.id === answerId ? { ...updated, replies: [] } : r,
          ),
        };
      }),
    );
  }

  async function handleDeleteAnswer(answerId: string) {
    if (!token) return;
    if (!window.confirm("¿Eliminar esta respuesta?")) return;
    let removed = 0;
    await deleteAnswer(token, answerId);
    setAnswers((curr) =>
      curr
        .map((a) => {
          if (a.id === answerId) {
            removed += 1 + a.replies.length;
            return null;
          }
          const filteredReplies = a.replies.filter((r) => {
            if (r.id === answerId) {
              removed += 1;
              return false;
            }
            return true;
          });
          return { ...a, replies: filteredReplies };
        })
        .filter((a): a is CommunityAnswerDto => a !== null),
    );
    setAnswerCount((c) => Math.max(0, c - removed));
    if (acceptedAnswerId === answerId) setAcceptedAnswerId(null);
  }

  const hasAccepted = !!acceptedAnswerId;
  const subtitle = [
    formatTimeAgo(question.createdAt),
    question.course,
    question.university,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="student-card overflow-hidden transition hover:-translate-y-px hover:border-[var(--app-primary)]/40">
      <div className="flex items-start gap-4 p-5">
        <button
          type="button"
          onClick={toggle}
          className={cn(
            "flex shrink-0 flex-col items-center gap-0.5 rounded-[var(--radius-sm)] px-2 py-1.5",
            hasAccepted ? "text-[var(--success)]" : "text-[var(--text-muted)]",
          )}
          aria-label={expanded ? "Cerrar pregunta" : "Abrir pregunta"}
        >
          {hasAccepted ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          ) : (
            <MessageCircle className="h-5 w-5" aria-hidden />
          )}
          <span className="text-xs font-semibold">{answerCount}</span>
        </button>

        <button
          type="button"
          onClick={toggle}
          className="min-w-0 flex-1 text-left"
        >
          <h3 className="font-semibold text-[var(--app-fg)]">{question.title}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {question.university && (
              <span className="rounded-full bg-[var(--app-surface-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--app-fg-secondary)]">
                {question.university}
              </span>
            )}
            {question.course && (
              <span className="rounded-full bg-[var(--app-surface-soft)] px-2.5 py-0.5 text-xs text-[var(--app-fg-secondary)]">
                {question.course}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-[var(--app-fg-muted)]">
            Preguntado por {question.author.name} · {formatTimeAgo(question.createdAt)} ·{" "}
            {viewCount} vistas
          </p>
        </button>

        <PostActionsMenu
          isAuthor={isAuthor}
          onEdit={() => onEdit(question)}
          onDelete={() => onDelete(question)}
          onReport={() => setReportOpen(true)}
        />
      </div>

      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="border-t border-[var(--app-border)] px-5 pb-5 pt-4">
          {question.body && (
            <p className="mb-4 whitespace-pre-wrap text-sm text-[var(--app-fg-secondary)]">
              {question.body}
            </p>
          )}
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--app-fg-muted)]">
            {subtitle}
          </p>

          {loading && (
            <p className="text-sm text-[var(--app-fg-muted)]">Cargando respuestas...</p>
          )}
          {error && (
            <p role="alert" className="text-sm text-[var(--error)]">
              {error}
            </p>
          )}

          {!loading && !error && answers.length === 0 && (
            <p className="text-sm text-[var(--app-fg-muted)]">
              Aún no hay respuestas. ¡Sé el primero en ayudar!
            </p>
          )}

          {answers.length > 0 && (
            <ul className="space-y-4">
              {answers.map((a) => (
                <AnswerItem
                  key={a.id}
                  answer={a}
                  currentUserId={currentUserId}
                  isQuestionAuthor={isAuthor}
                  acceptedAnswerId={acceptedAnswerId}
                  onVote={handleVote}
                  onAccept={handleAccept}
                  onReply={handleReply}
                  onEditAnswer={handleEditAnswer}
                  onDeleteAnswer={handleDeleteAnswer}
                />
              ))}
            </ul>
          )}

          <form onSubmit={handleNewAnswer} className="mt-4 flex items-start gap-2">
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={2}
              placeholder="Escribe tu respuesta..."
              className="flex-1 resize-none rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={submitting || !newAnswer.trim()}
              className="flex items-center gap-1 rounded-[var(--radius-md)] bg-[var(--accent)] px-3 py-2 text-sm font-medium text-[var(--accent-fg)] disabled:opacity-60"
            >
              <Send className="h-4 w-4" aria-hidden />
              Responder
            </button>
          </form>
        </div>
      </motion.div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="question"
        targetId={question.id}
      />
    </article>
  );
}

export const QuestionCard = memo(QuestionCardImpl);

interface AnswerItemProps {
  answer: CommunityAnswerDto;
  currentUserId: string | null;
  isQuestionAuthor: boolean;
  acceptedAnswerId: string | null;
  onVote: (answerId: string, currentlyUpvoted: boolean) => Promise<void>;
  onAccept: (answerId: string) => Promise<void>;
  onReply: (parentId: string, body: string) => Promise<void>;
  onEditAnswer: (answerId: string, body: string) => Promise<void>;
  onDeleteAnswer: (answerId: string) => Promise<void>;
  isReply?: boolean;
}

function AnswerItem({
  answer,
  currentUserId,
  isQuestionAuthor,
  acceptedAnswerId,
  onVote,
  onAccept,
  onReply,
  onEditAnswer,
  onDeleteAnswer,
  isReply = false,
}: AnswerItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(answer.body);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const isAuthor = currentUserId === answer.author.id;
  const isAccepted = acceptedAnswerId === answer.id;

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    const body = replyText.trim();
    if (!body) return;
    setReplySubmitting(true);
    try {
      await onReply(answer.id, body);
      setReplyText("");
      setReplyOpen(false);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al responder");
    } finally {
      setReplySubmitting(false);
    }
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    const body = editText.trim();
    if (!body) return;
    setEditSubmitting(true);
    try {
      await onEditAnswer(answer.id, body);
      setEditing(false);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al editar");
    } finally {
      setEditSubmitting(false);
    }
  }

  return (
    <li className={cn("flex gap-3", isAccepted && "rounded-xl bg-[var(--success-subtle)] p-3")}>
      <UserAvatar
        initial={getAuthorInitial(answer.author.name)}
        colorClass={authorColorClass(answer.author.name)}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-[var(--app-fg)]">
                {answer.author.name}
              </p>
              {isAccepted && (
                <span className="flex items-center gap-1 rounded-full bg-[var(--success-subtle)] px-2 py-0.5 text-[10px] font-semibold text-[var(--success)]">
                  <CheckCircle2 className="h-3 w-3" aria-hidden />
                  Aceptada
                </span>
              )}
            </div>
            {editing ? (
              <form onSubmit={submitEdit} className="mt-1 flex flex-col gap-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                  rows={3}
                  className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-2 py-1 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="rounded-lg bg-[var(--accent)] px-3 py-1 text-xs font-medium text-[var(--accent-fg)] disabled:opacity-60"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setEditText(answer.body);
                    }}
                    className="rounded-lg border border-[var(--app-border)] px-3 py-1 text-xs text-[var(--app-fg-secondary)]"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--app-fg-secondary)]">
                {answer.body}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => onVote(answer.id, answer.upvoted)}
                className={cn(
                  "flex items-center gap-1 transition-colors hover:text-[var(--app-primary)]",
                  answer.upvoted
                    ? "text-[var(--app-primary)]"
                    : "text-[var(--app-fg-muted)]",
                )}
              >
                <ThumbsUp
                  className={cn("h-3.5 w-3.5", answer.upvoted && "fill-current")}
                  aria-hidden
                />
                {answer.upvoteCount}
              </button>
              <span className="text-[var(--app-fg-muted)]">
                {formatTimeAgo(answer.createdAt)}
              </span>
              {!isReply && (
                <button
                  type="button"
                  onClick={() => setReplyOpen((o) => !o)}
                  className="text-[var(--app-fg-muted)] hover:text-[var(--app-primary)]"
                >
                  {replyOpen ? "Cancelar" : "Responder"}
                </button>
              )}
              {isQuestionAuthor && !isAuthor && !isAccepted && (
                <button
                  type="button"
                  onClick={() => onAccept(answer.id)}
                  className="text-[var(--success)] hover:underline"
                >
                  Aceptar respuesta
                </button>
              )}
            </div>
          </div>

          <PostActionsMenu
            isAuthor={isAuthor}
            onEdit={() => setEditing(true)}
            onDelete={() => onDeleteAnswer(answer.id)}
            onReport={() => setReportOpen(true)}
          />
        </div>

        {replyOpen && !isReply && (
          <form onSubmit={submitReply} className="mt-2 flex items-start gap-2">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoFocus
              rows={2}
              placeholder="Responder a esta respuesta..."
              className="flex-1 resize-none rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-2 py-1 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
            />
            <button
              type="submit"
              disabled={replySubmitting || !replyText.trim()}
              className="rounded-lg bg-[var(--accent)] px-3 py-1 text-xs font-medium text-[var(--accent-fg)] disabled:opacity-60"
            >
              Enviar
            </button>
          </form>
        )}

        {answer.replies.length > 0 && (
          <ul className="mt-3 space-y-3 border-l-[0.5px] border-[var(--app-border)] pl-3">
            {answer.replies.map((r) => (
              <AnswerItem
                key={r.id}
                answer={r}
                currentUserId={currentUserId}
                isQuestionAuthor={isQuestionAuthor}
                acceptedAnswerId={acceptedAnswerId}
                onVote={onVote}
                onAccept={onAccept}
                onReply={onReply}
                onEditAnswer={onEditAnswer}
                onDeleteAnswer={onDeleteAnswer}
                isReply
              />
            ))}
          </ul>
        )}

        <ReportModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          targetType="answer"
          targetId={answer.id}
        />
      </div>
    </li>
  );
}
