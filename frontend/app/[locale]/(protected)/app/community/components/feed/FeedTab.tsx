"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import {
  deletePost,
  listPosts,
  type CommunityPostDto,
} from "@/app/lib/community-api";
import { CommunityFooter } from "../CommunityFooter";
import { FeedPostCard } from "./FeedPostCard";
import { NewPostComposer } from "./NewPostComposer";
import { EditPostModal } from "./EditPostModal";

interface FeedTabProps {
  onOpenModal: () => void;
  refreshKey: number;
}

export function FeedTab({ onOpenModal, refreshKey }: FeedTabProps) {
  const { token, user } = useAuth();
  const [posts, setPosts] = useState<CommunityPostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<CommunityPostDto | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listPosts(token)
      .then((data) => {
        if (!cancelled) setPosts(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Error al cargar el feed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, refreshKey]);

  const handleDelete = useCallback(
    async (post: CommunityPostDto) => {
      if (!token) return;
      if (
        !window.confirm(
          "¿Eliminar esta publicación? Esta acción no se puede deshacer.",
        )
      ) {
        return;
      }
      try {
        await deletePost(token, post.id);
        setPosts((curr) => curr.filter((p) => p.id !== post.id));
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "No se pudo eliminar");
      }
    },
    [token],
  );

  const handleEdit = useCallback((post: CommunityPostDto) => {
    setEditing(post);
  }, []);

  const handleUpdated = useCallback((updated: CommunityPostDto) => {
    setPosts((curr) => curr.map((p) => (p.id === updated.id ? updated : p)));
    setEditing(null);
  }, []);

  const handleLikeChange = useCallback(
    (postId: string, liked: boolean, likeCount: number) => {
      setPosts((curr) =>
        curr.map((p) => (p.id === postId ? { ...p, liked, likeCount } : p)),
      );
    },
    [],
  );

  const handleCommentDelta = useCallback((postId: string, delta: number) => {
    setPosts((curr) =>
      curr.map((p) =>
        p.id === postId
          ? { ...p, commentCount: Math.max(0, p.commentCount + delta) }
          : p,
      ),
    );
  }, []);

  return (
    <div>
      <NewPostComposer onOpen={onOpenModal} />
      {loading && (
        <p className="rounded-xl border border-[var(--app-border)] p-6 text-center text-sm text-[var(--app-fg-muted)]">
          Cargando feed...
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-[var(--error)]/30 bg-[var(--error-subtle)] p-4 text-sm text-[var(--error)]"
        >
          {error}
        </p>
      )}
      {!loading && !error && posts.length === 0 && (
        <div className="student-card flex flex-col items-center gap-2 p-8 text-center">
          <p className="text-sm font-medium text-[var(--app-fg)]">
            Aún no hay publicaciones
          </p>
          <p className="text-xs text-[var(--app-fg-muted)]">
            Sé el primero en compartir algo con tu universidad.
          </p>
        </div>
      )}
      <div className="space-y-4">
        {posts.map((post) => (
          <FeedPostCard
            key={post.id}
            post={post}
            currentUserId={user?.id ?? null}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onLikeChange={handleLikeChange}
            onCommentDelta={handleCommentDelta}
          />
        ))}
      </div>
      <CommunityFooter />
      <EditPostModal
        post={editing}
        onClose={() => setEditing(null)}
        onUpdated={handleUpdated}
      />
    </div>
  );
}
