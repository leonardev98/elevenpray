"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAuth } from "../../../../../../../providers/auth-provider";
import { getPage, updatePage, type PageApi } from "../../../../../../../lib/pages-api";
import {
  getBlocks,
  createBlock,
  updateBlock,
  deleteBlock,
  reorderBlocks,
  type BlockApi,
} from "../../../../../../../lib/blocks-api";
import { BlockRenderer } from "../../../../components/block-renderer";

function SortableBlockRow({
  block,
  onContentChange,
  onDelete,
  onKeyDown,
  autoFocus,
}: {
  block: BlockApi;
  onContentChange: (blockId: string, content: Record<string, unknown>) => void;
  onDelete: (blockId: string) => void;
  onKeyDown: (blockId: string, e: React.KeyboardEvent) => void;
  autoFocus?: boolean;
}) {
  const t = useTranslations("blocks");
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-stretch gap-1 rounded-lg py-0.5 ${isDragging ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1.5 text-[var(--app-fg)]/40 hover:bg-[var(--app-gold)]/10 hover:text-[var(--app-gold)] active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label={t("moveBlock")}
      >
        ⋮⋮
      </button>
      <div className="min-w-0 flex-1">
        <BlockRenderer
          block={block}
          onContentChange={(content) => onContentChange(block.id, content)}
          onDelete={() => onDelete(block.id)}
          onKeyDown={(e) => onKeyDown(block.id, e)}
          autoFocus={autoFocus}
          placeholder={t("placeholderWriteHere")}
        />
      </div>
    </div>
  );
}

const BLOCK_TYPE_KEYS = [
  { type: "text", labelKey: "blockTypeText" as const },
  { type: "heading", labelKey: "blockTypeHeading" as const },
  { type: "checklist", labelKey: "blockTypeChecklist" as const },
];

export default function PageEditorPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const pageId = params.pageId as string;
  const { token } = useAuth();
  const t = useTranslations("blocks");
  const tCommon = useTranslations("common");
  const [page, setPage] = useState<PageApi | null>(null);
  const [blocks, setBlocks] = useState<BlockApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slashOpen, setSlashOpen] = useState(false);
  const [focusNewId, setFocusNewId] = useState<string | null>(null);

  const loadBlocks = useCallback(() => {
    if (!token || !pageId) return;
    getBlocks(token, pageId).then(setBlocks).catch(() => {});
  }, [token, pageId]);

  useEffect(() => {
    if (!token || !pageId) return;
    getPage(token, pageId)
      .then((p) => {
        setPage(p);
        setTitle(p.title);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
    loadBlocks();
  }, [token, pageId, loadBlocks]);

  async function handleSaveTitle() {
    if (!token || !pageId || title === (page?.title ?? "")) return;
    setSaving(true);
    setError("");
    try {
      const updated = await updatePage(token, pageId, { title: title.trim() || "Sin título" });
      setPage(updated);
      setTitle(updated.title);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function handleContentChange(blockId: string, content: Record<string, unknown>) {
    if (!token) return;
    const block = blocks.find((b) => b.id === blockId);
    if (!block || JSON.stringify(block.content) === JSON.stringify(content)) return;
    try {
      const updated = await updateBlock(token, blockId, { content });
      setBlocks((prev) => prev.map((b) => (b.id === blockId ? updated : b)));
    } catch {
      // ignore
    }
  }

  async function handleAddBlock(type: string) {
    if (!token || !pageId) return;
    setSlashOpen(false);
    setError("");
    try {
      const content = type === "checklist" ? { items: [] } : { text: "" };
      const created = await createBlock(token, pageId, { type, content });
      setBlocks((prev) => [...prev, created]);
      setFocusNewId(created.id);
      setTimeout(() => setFocusNewId(null), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errorCreateBlock"));
    }
  }

  async function handleDeleteBlock(blockId: string) {
    if (!token) return;
    try {
      await deleteBlock(token, blockId);
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errorDelete"));
    }
  }

  function handleBlockKeyDown(blockId: string, e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddBlock("text");
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || !token) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(blocks, oldIndex, newIndex);
    setBlocks(next);
    try {
      const reordered = await reorderBlocks(token, pageId, next.map((b) => b.id));
      setBlocks(reordered);
    } catch {
      setBlocks(blocks);
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (loading || !page) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-[var(--app-fg)]/60">
          {loading ? tCommon("loading") : t("pageNotFound")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/dashboard/workspaces/${workspaceId}`}
          className="text-sm font-medium text-[var(--app-fg)]/70 hover:text-[var(--app-gold)]"
        >
          {t("backToWorkspace")}
        </Link>
      </div>
      {error && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSaveTitle}
          disabled={saving}
          className="mb-4 w-full rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-lg font-semibold text-[var(--app-fg)] placeholder:text-[var(--app-fg)]/50 focus:border-[var(--app-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--app-gold)] disabled:opacity-50"
          placeholder={t("pageTitlePlaceholder")}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {blocks.map((block) => (
                <SortableBlockRow
                  key={block.id}
                  block={block}
                  onContentChange={handleContentChange}
                  onDelete={handleDeleteBlock}
                  onKeyDown={handleBlockKeyDown}
                  autoFocus={focusNewId === block.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="relative mt-4">
          {slashOpen ? (
            <div className="absolute left-0 top-0 z-10 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] py-1 shadow-lg">
              {BLOCK_TYPE_KEYS.map(({ type, labelKey }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleAddBlock(type)}
                  className="block w-full px-4 py-2 text-left text-sm text-[var(--app-fg)] hover:bg-[var(--app-gold)]/10"
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setSlashOpen((o) => !o)}
            className="rounded-lg border border-dashed border-[var(--app-border)] py-2 px-3 text-sm text-[var(--app-fg)]/50 hover:border-[var(--app-gold)]/50 hover:text-[var(--app-gold)]"
          >
            + {t("addBlock")}
          </button>
        </div>
      </div>
    </div>
  );
}
