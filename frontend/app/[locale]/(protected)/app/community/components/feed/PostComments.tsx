"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useAuth } from "@/app/providers/auth-provider";
import {
  createComment,
  deleteComment,
  listComments,
  updateComment,
  type CommunityCommentDto,
} from "@/app/lib/community-api";
import { UserAvatar } from "../UserAvatar";
import { PostActionsMenu } from "../PostActionsMenu";
import { ReportModal } from "../ReportModal";
import {
  authorColorClass,
  formatTimeAgo,
  getAuthorInitial,
} from "../../community-utils";

interface PostCommentsProps {
  postId: string;
  currentUserId: string | null;
  onDelta: (delta: number) => void;
}

function PostCommentsImpl({ postId, currentUserId, onDelta }: PostCommentsProps) {
  const { token, user } = useAuth();
  const [comments, setComments] = useState<CommunityCommentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para callback estable sin re-disparar el useEffect.
  const onDeltaRef = useRef(onDelta);
  useEffect(() => {
    onDeltaRef.current = onDelta;
  }, [onDelta]);

  // Carga una sola vez por (token, postId). NO incluimos onDelta en deps:
  // de lo contrario cada nueva referencia del padre re-dispara el fetch.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listComments(token, postId)
      .then((data) => {
        if (cancelled) return;
        setComments(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Error al cargar comentarios");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || submitting) return;
    const body = text.trim();
    if (!body) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await createComment(token, postId, { body });
      setComments((curr) => [...curr, { ...created, replies: [] }]);
      onDeltaRef.current(+1);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al comentar");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: string, body: string): Promise<void> {
    if (!token) return;
    const created = await createComment(token, postId, { body, parentId });
    setComments((curr) =>
      curr.map((c) =>
        c.id === parentId ? { ...c, replies: [...c.replies, created] } : c,
      ),
    );
    onDeltaRef.current(+1);
  }

  async function handleEdit(commentId: string, newBody: string): Promise<void> {
    if (!token) return;
    const updated = await updateComment(token, commentId, newBody);
    setComments((curr) =>
      curr.map((c) => {
        if (c.id === commentId) return { ...updated, replies: c.replies };
        return {
          ...c,
          replies: c.replies.map((r) =>
            r.id === commentId ? { ...updated, replies: [] } : r,
          ),
        };
      }),
    );
  }

  async function handleDelete(commentId: string): Promise<void> {
    if (!token) return;
    if (!window.confirm("¿Eliminar este comentario?")) return;
    await deleteComment(token, commentId);
    let removed = 0;
    setComments((curr) =>
      curr
        .map((c) => {
          if (c.id === commentId) {
            removed += 1 + c.replies.length;
            return null;
          }
          const filteredReplies = c.replies.filter((r) => {
            if (r.id === commentId) {
              removed += 1;
              return false;
            }
            return true;
          });
          return { ...c, replies: filteredReplies };
        })
        .filter((c): c is CommunityCommentDto => c !== null),
    );
    if (removed > 0) onDeltaRef.current(-removed);
  }

  const me = user?.name ?? "Tú";

  return (
    <div className="border-t border-[var(--app-border)] pt-4">
      {loading ? (
        <p className="text-sm text-[var(--app-fg-muted)]">Cargando comentarios...</p>
      ) : comments.length === 0 ? (
        <p className="mb-3 text-sm text-[var(--app-fg-muted)]">
          Sé el primero en comentar.
        </p>
      ) : (
        <ul className="mb-4 space-y-3">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mb-2 text-xs text-[var(--error)]">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <UserAvatar
          initial={getAuthorInitial(me)}
          colorClass={authorColorClass(me)}
          size="sm"
        />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un comentario..."
          className="flex-1 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-3 py-2 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)] focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          aria-label="Enviar comentario"
          className="rounded-lg p-2 text-[var(--app-fg-muted)] transition-colors hover:bg-[var(--app-surface-soft)] hover:text-[var(--app-primary)] disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

export const PostComments = memo(PostCommentsImpl);

interface CommentItemProps {
  comment: CommunityCommentDto;
  currentUserId: string | null;
  onReply: (parentId: string, body: string) => Promise<void>;
  onEdit: (commentId: string, body: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  isReply?: boolean;
}

function CommentItem({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  isReply = false,
}: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.body);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const isAuthor = currentUserId === comment.author.id;

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    const body = replyText.trim();
    if (!body) return;
    setReplySubmitting(true);
    try {
      await onReply(comment.id, body);
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
      await onEdit(comment.id, body);
      setEditing(false);
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Error al editar");
    } finally {
      setEditSubmitting(false);
    }
  }

  return (
    <li className="flex gap-3">
      <UserAvatar
        initial={getAuthorInitial(comment.author.name)}
        colorClass={authorColorClass(comment.author.name)}
        size="sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[var(--app-fg)]">
              {comment.author.name}
            </p>
            {editing ? (
              <form onSubmit={submitEdit} className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  autoFocus
                  className="flex-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-2 py-1 text-sm text-[var(--app-fg)] focus:border-[var(--app-primary)] focus:outline-none"
                />
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
                    setEditText(comment.body);
                  }}
                  className="rounded-lg border border-[var(--app-border)] px-3 py-1 text-xs text-[var(--app-fg-secondary)]"
                >
                  Cancelar
                </button>
              </form>
            ) : (
              <p className="whitespace-pre-wrap text-sm text-[var(--app-fg-secondary)]">
                {comment.body}
              </p>
            )}
            <div className="mt-1 flex items-center gap-3 text-xs text-[var(--app-fg-muted)]">
              <span>{formatTimeAgo(comment.createdAt)}</span>
              {!isReply && (
                <button
                  type="button"
                  onClick={() => setReplyOpen((o) => !o)}
                  className="hover:text-[var(--app-primary)]"
                >
                  {replyOpen ? "Cancelar" : "Responder"}
                </button>
              )}
            </div>
          </div>
          <PostActionsMenu
            isAuthor={isAuthor}
            onEdit={() => setEditing(true)}
            onDelete={() => onDelete(comment.id)}
            onReport={() => setReportOpen(true)}
          />
        </div>

        {replyOpen && !isReply && (
          <form onSubmit={submitReply} className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              autoFocus
              placeholder="Responder..."
              className="flex-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-2 py-1 text-sm text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)] focus:border-[var(--app-primary)] focus:outline-none"
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

        {comment.replies.length > 0 && (
          <ul className="mt-3 space-y-3 border-l-[0.5px] border-[var(--app-border)] pl-3">
            {comment.replies.map((r) => (
              <CommentItem
                key={r.id}
                comment={r}
                currentUserId={currentUserId}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                isReply
              />
            ))}
          </ul>
        )}

        <ReportModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          targetType="comment"
          targetId={comment.id}
        />
      </div>
    </li>
  );
}
