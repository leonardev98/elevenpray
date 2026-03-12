"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import { useTranslations } from "next-intl";
import {
  usePrompts,
  usePrompt,
  usePromptFolders,
  usePromptCategories,
  useDeveloperProjects,
  usePromptTags,
  setPromptFavorite,
  setPromptPinned,
  archivePrompt,
  unarchivePrompt,
  recordPromptUse,
  duplicatePrompt,
  deletePrompt,
} from "@/app/lib/developer-workspace";
import type { ListPromptsParams } from "@/app/lib/developer-workspace";
import type { PromptApi } from "@/app/lib/developer-workspace/types";
import type { SortOption } from "./components/PromptList";
import { PromptsAside } from "./components/PromptsAside";
import { PromptList } from "./components/PromptList";
import { PromptDetailPanel } from "./components/PromptDetailPanel";
import { PromptFormDrawer } from "./components/PromptFormDrawer";
import { NewFolderDrawer } from "./components/NewFolderDrawer";

export default function PromptsPage() {
  const t = useTranslations("developerWorkspace.prompts");
  const { token } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"all" | "favorites" | "recent" | "archived" | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<"prompt" | "folder" | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<PromptApi | null>(null);

  const listParams = useMemo((): ListPromptsParams => {
    const p: ListPromptsParams = { sortBy, sortOrder };
    if (viewMode === "favorites") p.isFavorite = true;
    if (viewMode === "recent") p.recent = true;
    if (viewMode === "archived") p.status = "archived";
    if (selectedFolderId) p.folderId = selectedFolderId;
    if (selectedCategoryId) p.categoryId = selectedCategoryId;
    if (search.trim()) p.search = search.trim();
    return p;
  }, [viewMode, selectedFolderId, selectedCategoryId, search, sortBy, sortOrder]);

  const { data: prompts, isLoading: loadingList, refetch: refetchPrompts } = usePrompts(token, listParams);
  const { data: selectedPrompt, refetch: refetchSelected } = usePrompt(token, selectedId);
  const { data: folders, refetch: refetchFolders } = usePromptFolders(token);
  const { data: categories } = usePromptCategories(token);
  const { data: projects, refetch: refetchProjects } = useDeveloperProjects(token);
  const { data: tags } = usePromptTags(token);

  const refetchAll = useCallback(() => {
    refetchPrompts();
    refetchSelected();
    refetchFolders();
    refetchProjects();
  }, [refetchPrompts, refetchSelected, refetchFolders, refetchProjects]);

  const handleCopy = useCallback(
    async (prompt: PromptApi) => {
      if (!token) return;
      try {
        await navigator.clipboard.writeText(prompt.content);
        setCopiedId(prompt.id);
        setTimeout(() => setCopiedId(null), 2000);
        await recordPromptUse(token, prompt.id);
        refetchPrompts();
        refetchSelected();
      } catch {
        // ignore
      }
    },
    [token, refetchPrompts, refetchSelected]
  );

  const handleToggleFavorite = useCallback(
    async (prompt: PromptApi) => {
      if (!token) return;
      try {
        await setPromptFavorite(token, prompt.id, !prompt.isFavorite);
        refetchAll();
      } catch {
        // ignore
      }
    },
    [token, refetchAll]
  );

  const handleTogglePin = useCallback(
    async (prompt: PromptApi) => {
      if (!token) return;
      try {
        await setPromptPinned(token, prompt.id, !prompt.isPinned);
        refetchAll();
      } catch {
        // ignore
      }
    },
    [token, refetchAll]
  );

  const handleArchive = useCallback(
    async (prompt: PromptApi) => {
      if (!token) return;
      try {
        if (prompt.status === "archived") {
          await unarchivePrompt(token, prompt.id);
        } else {
          await archivePrompt(token, prompt.id);
        }
        refetchAll();
        if (selectedId === prompt.id) setSelectedId(null);
      } catch {
        // ignore
      }
    },
    [token, refetchAll, selectedId]
  );

  const handleDuplicate = useCallback(
    async (prompt: PromptApi) => {
      if (!token) return;
      try {
        const created = await duplicatePrompt(token, prompt.id);
        refetchAll();
        setSelectedId(created.id);
      } catch {
        // ignore
      }
    },
    [token, refetchAll]
  );

  const handleDelete = useCallback(
    async (prompt: PromptApi) => {
      if (!token) return;
      if (!confirm("¿Eliminar este prompt?")) return;
      try {
        await deletePrompt(token, prompt.id);
        refetchAll();
        if (selectedId === prompt.id) setSelectedId(null);
      } catch {
        // ignore
      }
    },
    [token, refetchAll, selectedId]
  );

  const handleEdit = useCallback((prompt: PromptApi) => {
    setEditingPrompt(prompt);
    setDrawerOpen("prompt");
  }, []);

  const handleNewFolder = useCallback(() => {
    setDrawerOpen("folder");
  }, []);

  const openCreatePrompt = useCallback(() => {
    setEditingPrompt(null);
    setDrawerOpen("prompt");
  }, []);

  // Auto-seleccionar el primer prompt cuando hay lista y ninguna selección
  useEffect(() => {
    if (loadingList || !prompts?.length || selectedId !== null) return;
    setSelectedId(prompts[0].id);
  }, [loadingList, prompts, selectedId]);

  const hasPrompts = (prompts?.length ?? 0) > 0;
  const showDetailPanel = hasPrompts && selectedId !== null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-start justify-between gap-4 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--app-fg)]">{t("title")}</h1>
          <p className="mt-1 text-sm text-[var(--app-fg)]/60">{t("subtitle")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleNewFolder}
            className="rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] px-3 py-2 text-sm font-medium text-[var(--app-fg)] hover:bg-[var(--app-bg)]"
          >
            {t("newFolder")}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingPrompt(null);
              setDrawerOpen("prompt");
            }}
            className="rounded-lg bg-[var(--app-navy)] px-3 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            {t("newPrompt")}
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <PromptsAside
          folders={folders}
          categories={categories}
          selectedFolderId={selectedFolderId}
          selectedCategoryId={selectedCategoryId}
          viewMode={viewMode}
          onSelectFolder={setSelectedFolderId}
          onSelectCategory={setSelectedCategoryId}
          onViewMode={setViewMode}
          onNewFolder={handleNewFolder}
        />
        <div className="flex min-h-0 min-w-0 flex-1 gap-4">
          <div className="flex min-h-0 min-w-0 flex-[1_1_400px] flex-col">
            <PromptList
              prompts={prompts}
              folders={folders}
              categories={categories}
              projects={projects}
              selectedId={selectedId}
              search={search}
              sortBy={sortBy}
              sortOrder={sortOrder}
              copiedId={copiedId}
              onSearchChange={setSearch}
              onSortChange={(by, order) => {
                setSortBy(by);
                setSortOrder(order);
              }}
              onSelect={(p) => setSelectedId(p.id)}
              onCopy={handleCopy}
              onToggleFavorite={handleToggleFavorite}
              onTogglePin={handleTogglePin}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onDelete={handleDelete}
              onEmptyCreateClick={openCreatePrompt}
              isLoading={loadingList}
              isInitialEmpty={
                !loadingList &&
                (prompts?.length ?? 0) === 0 &&
                !search &&
                !selectedFolderId &&
                !selectedCategoryId &&
                viewMode === null
              }
            />
          </div>
          {showDetailPanel && (
            <div className="hidden min-h-0 min-w-0 flex-[1_1_320px] flex flex-col lg:flex">
              <PromptDetailPanel
              prompt={selectedPrompt ?? null}
              onEdit={() => selectedPrompt && handleEdit(selectedPrompt)}
              onCopy={() => selectedPrompt && handleCopy(selectedPrompt)}
              onDuplicate={() => selectedPrompt && handleDuplicate(selectedPrompt)}
              onToggleFavorite={() => selectedPrompt && handleToggleFavorite(selectedPrompt)}
              onTogglePin={() => selectedPrompt && handleTogglePin(selectedPrompt)}
              copied={selectedPrompt ? copiedId === selectedPrompt.id : false}
              />
            </div>
          )}
        </div>
      </div>

      <PromptFormDrawer
        open={drawerOpen === "prompt"}
        onClose={() => {
          setDrawerOpen(null);
          setEditingPrompt(null);
        }}
        prompt={editingPrompt}
        folders={folders}
        categories={categories}
        projects={projects}
        tagSuggestions={tags?.map((t) => t.name) ?? []}
        token={token}
        onSuccess={refetchAll}
      />
      <NewFolderDrawer
        open={drawerOpen === "folder"}
        onClose={() => setDrawerOpen(null)}
        token={token}
        onSuccess={() => {
          refetchFolders();
          refetchPrompts();
        }}
      />
    </div>
  );
}
