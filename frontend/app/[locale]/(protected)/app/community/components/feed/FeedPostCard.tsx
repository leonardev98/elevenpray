"use client";

import { memo, useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  Download,
  FileText,
  Heart,
  LayoutTemplate,
  MessageCircle,
  Share2,
} from "lucide-react";
import { useAuth } from "@/app/providers/auth-provider";
import {
  likePost,
  unlikePost,
  type CommunityPostDto,
} from "@/app/lib/community-api";
import { PostTypeBadge } from "../PostTypeBadge";
import { UserAvatar } from "../UserAvatar";
import { PostComments } from "./PostComments";
import { PostActionsMenu } from "../PostActionsMenu";
import { ReportModal } from "../ReportModal";
import {
  authorColorClass,
  formatFileSize,
  formatTimeAgo,
  getAuthorInitial,
} from "../../community-utils";
import { cn } from "@/lib/utils";

interface FeedPostCardProps {
  post: CommunityPostDto;
  currentUserId: string | null;
  onEdit: (post: CommunityPostDto) => void;
  onDelete: (post: CommunityPostDto) => void;
  onLikeChange: (postId: string, liked: boolean, likeCount: number) => void;
  onCommentDelta: (postId: string, delta: number) => void;
}

function FeedPostCardImpl({
  post,
  currentUserId,
  onEdit,
  onDelete,
  onLikeChange,
  onCommentDelta,
}: FeedPostCardProps) {
  const { token } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const isAuthor = currentUserId === post.author.id;

  // Estable: solo depende de postId y onCommentDelta. PostComments es memo,
  // así que mantener referencia estable evita re-renders en cadena.
  const handleCommentsDelta = useCallback(
    (delta: number) => onCommentDelta(post.id, delta),
    [post.id, onCommentDelta],
  );

  async function toggleLike() {
    if (!token || likeLoading) return;
    setLikeLoading(true);
    const wasLiked = post.liked;
    const optimisticCount = wasLiked ? post.likeCount - 1 : post.likeCount + 1;
    onLikeChange(post.id, !wasLiked, Math.max(0, optimisticCount));
    try {
      const res = wasLiked
        ? await unlikePost(token, post.id)
        : await likePost(token, post.id);
      onLikeChange(post.id, res.liked, res.likeCount);
    } catch (err) {
      onLikeChange(post.id, wasLiked, post.likeCount);
      window.alert(err instanceof Error ? err.message : "Error al actualizar like");
    } finally {
      setLikeLoading(false);
    }
  }

  const authorName = post.author.name;
  const subtitle = [
    formatTimeAgo(post.createdAt),
    post.course,
    post.university,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="student-card p-5 transition hover:-translate-y-px hover:border-[var(--app-primary)]/40">
      <header className="mb-4 flex items-start gap-3">
        <UserAvatar
          initial={getAuthorInitial(authorName)}
          colorClass={authorColorClass(authorName)}
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[var(--app-fg)]">{authorName}</p>
          <p className="text-xs text-[var(--app-fg-muted)]">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <PostTypeBadge type={post.type} />
          <PostActionsMenu
            isAuthor={isAuthor}
            onEdit={() => onEdit(post)}
            onDelete={() => onDelete(post)}
            onReport={() => setReportOpen(true)}
          />
        </div>
      </header>

      <h3 className="mb-2 text-base font-semibold text-[var(--app-fg)]">{post.title}</h3>
      {post.body && (
        <div className="mb-4">
          <p
            className={cn(
              "whitespace-pre-wrap text-sm text-[var(--app-fg-secondary)] transition-all duration-200",
              !expanded && "line-clamp-3",
            )}
          >
            {post.body}
          </p>
          {post.body.length > 180 && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="mt-1 text-sm text-[var(--app-primary)] hover:underline"
            >
              {expanded ? "ver menos" : "... ver más"}
            </button>
          )}
        </div>
      )}

      {post.type === "pdf" && post.attachmentUrl && (
        <a
          href={post.attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-[var(--app-surface-soft)] p-3 transition hover:bg-[var(--app-surface)]"
        >
          <FileText className="h-5 w-5 text-[var(--app-fg-muted)]" aria-hidden />
          <span className="flex-1 truncate text-sm text-[var(--app-fg-muted)]">
            {post.attachmentName ?? "Documento"}
          </span>
          {post.attachmentSizeBytes && (
            <span className="text-xs text-[var(--app-fg-muted)]">
              {formatFileSize(post.attachmentSizeBytes)}
            </span>
          )}
          <span className="flex items-center gap-1 rounded-lg border border-[var(--app-border)] px-2.5 py-1 text-xs text-[var(--app-fg-secondary)]">
            <Download className="h-3.5 w-3.5" aria-hidden />
            Descargar
          </span>
        </a>
      )}

      {post.type === "plantilla" && post.attachmentUrl && (
        <a
          href={post.attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 flex h-28 flex-col items-center justify-center rounded-xl bg-[var(--app-surface-soft)] transition hover:bg-[var(--app-surface)]"
        >
          {post.attachmentMime?.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.attachmentUrl}
              alt={post.attachmentName ?? post.title}
              className="h-28 w-full rounded-xl object-cover"
            />
          ) : (
            <>
              <LayoutTemplate
                className="h-10 w-10 text-[var(--app-primary)] opacity-40"
                aria-hidden
              />
              <p className="mt-2 text-xs text-[var(--app-fg-muted)]">
                {post.attachmentName ?? "Plantilla"}
              </p>
            </>
          )}
        </a>
      )}

      <footer className="flex flex-wrap items-center gap-4 border-t-[0.5px] border-[var(--border)] pt-4">
        <motion.button
          type="button"
          onClick={toggleLike}
          whileTap={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.15 }}
          disabled={!token}
          className={cn(
            "flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--text-primary)] disabled:opacity-60",
            post.liked ? "text-[var(--error)]" : "text-[var(--text-muted)]",
          )}
        >
          <Heart className={cn("h-4 w-4", post.liked && "fill-current")} aria-hidden />
          {post.likeCount}
        </motion.button>
        <button
          type="button"
          onClick={() => setCommentsOpen((o) => !o)}
          className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          {post.commentCount}
        </button>
        <button
          type="button"
          onClick={() => setBookmarked((b) => !b)}
          className={cn(
            "flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--text-primary)]",
            bookmarked ? "text-[var(--accent)]" : "text-[var(--text-muted)]",
          )}
          aria-label={bookmarked ? "Quitar guardado" : "Guardar"}
        >
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} aria-hidden />
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
          aria-label="Compartir"
          onClick={() => {
            if (typeof navigator !== "undefined" && navigator.share) {
              navigator
                .share({ title: post.title, text: post.body ?? "", url: window.location.href })
                .catch(() => undefined);
            } else if (typeof navigator !== "undefined" && navigator.clipboard) {
              navigator.clipboard.writeText(window.location.href).catch(() => undefined);
            }
          }}
        >
          <Share2 className="h-4 w-4" aria-hidden />
        </button>
      </footer>

      <motion.div
        initial={false}
        animate={{
          height: commentsOpen ? "auto" : 0,
          opacity: commentsOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        {commentsOpen && (
          <div className="mt-4">
            <PostComments
              postId={post.id}
              currentUserId={currentUserId}
              onDelta={handleCommentsDelta}
            />
          </div>
        )}
      </motion.div>

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="post"
        targetId={post.id}
      />
    </article>
  );
}

export const FeedPostCard = memo(FeedPostCardImpl);
