"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bookmark,
  Download,
  FileText,
  Heart,
  LayoutTemplate,
  MessageCircle,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import type { FeedPost, MockComment } from "../../community-types";
import { PostTypeBadge } from "../PostTypeBadge";
import { UserAvatar } from "../UserAvatar";
import { PostComments } from "./PostComments";
import { cn } from "@/lib/utils";

export function FeedPostCard({
  post,
  comments,
}: {
  post: FeedPost;
  comments: MockComment[];
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [bookmarked, setBookmarked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  function toggleLike() {
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  }

  return (
    <article className="student-card p-5 transition hover:-translate-y-px hover:border-[var(--app-primary)]/40">
      <header className="mb-4 flex items-start gap-3">
        <UserAvatar initial={post.authorInitial} colorClass={post.authorColor} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[var(--app-fg)]">{post.author}</p>
          <p className="text-xs text-[var(--app-fg-muted)]">
            {post.timeAgo} · {post.course} — {post.university}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <PostTypeBadge type={post.type} />
          <button
            type="button"
            aria-label="Más opciones"
            className="rounded-lg p-1 text-[var(--app-fg-muted)] hover:text-[var(--app-fg)]"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </header>

      <h3 className="mb-2 text-base font-semibold text-[var(--app-fg)]">{post.title}</h3>
      <div className="mb-4">
        <p
          className={cn(
            "text-sm text-[var(--app-fg-secondary)] transition-all duration-200",
            !expanded && "line-clamp-3",
          )}
        >
          {post.body}
        </p>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-sm text-[var(--app-primary)] hover:underline"
        >
          {expanded ? "ver menos" : "... ver más"}
        </button>
      </div>

      {post.type === "pdf" && post.pdfFile && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-[var(--app-surface-soft)] p-3">
          <FileText className="h-5 w-5 text-[var(--app-fg-muted)]" aria-hidden />
          <span className="flex-1 text-sm text-[var(--app-fg-muted)]">{post.pdfFile.name}</span>
          <span className="text-xs text-[var(--app-fg-muted)]">{post.pdfFile.size}</span>
          <button
            type="button"
            className="flex items-center gap-1 rounded-lg border border-[var(--app-border)] px-2.5 py-1 text-xs text-[var(--app-fg-secondary)] hover:border-[var(--app-primary)]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden />
            Descargar
          </button>
        </div>
      )}

      {post.type === "plantilla" && (
        <div className="mb-4 flex h-28 flex-col items-center justify-center rounded-xl bg-[var(--app-surface-soft)]">
          <LayoutTemplate className="h-10 w-10 text-[var(--app-primary)] opacity-40" aria-hidden />
          <p className="mt-2 text-xs text-[var(--app-fg-muted)]">Vista previa no disponible</p>
        </div>
      )}

      <footer className="flex flex-wrap items-center gap-4 border-t-[0.5px] border-[var(--border)] pt-4">
        <motion.button
          type="button"
          onClick={toggleLike}
          whileTap={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.15 }}
          className={cn(
            "flex items-center gap-1.5 text-sm transition-colors hover:text-[var(--text-primary)]",
            liked ? "text-[var(--error)]" : "text-[var(--text-muted)]",
          )}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-current")} aria-hidden />
          {likeCount}
        </motion.button>
        <button
          type="button"
          onClick={() => setCommentsOpen((o) => !o)}
          className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          {post.comments}
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
            <PostComments comments={comments} />
          </div>
        )}
      </motion.div>
    </article>
  );
}
