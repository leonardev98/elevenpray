"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import { useTranslations } from "next-intl";
import {
  usePrompts,
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
import { PromptDiscoveryPanel } from "./components/PromptDiscoveryPanel";
import { PromptFullViewModal } from "./components/PromptFullViewModal";
import { PromptFormDrawer } from "./components/PromptFormDrawer";
import { NewFolderDrawer } from "./components/NewFolderDrawer";
import { ImportPromptDrawer } from "./components/ImportPromptDrawer";

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
  const [drawerOpen, setDrawerOpen] = useState<"prompt" | "folder" | "import" | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<PromptApi | null>(null);
  const [templateMode, setTemplateMode] = useState(false);
  const [fullViewPrompt, setFullViewPrompt] = useState<PromptApi | null>(null);
  const [listPage, setListPage] = useState(0);

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
  const { data: folders, refetch: refetchFolders } = usePromptFolders(token);
  const { data: categories } = usePromptCategories(token);
  const { data: projects, refetch: refetchProjects } = useDeveloperProjects(token);
  const { data: tags } = usePromptTags(token);

  const tagSuggestions = useMemo(() => {
    const fromApi = tags?.map((t) => t.name) ?? [];
    const fixed = ["React", "SQL", "Testing", "Debug", "Architecture"];
    return [...new Set([...fixed, ...fromApi])];
  }, [tags]);

  const refetchAll = useCallback(() => {
    refetchPrompts();
    refetchFolders();
    refetchProjects();
  }, [refetchPrompts, refetchFolders, refetchProjects]);

  const handleCopy = useCallback(
    async (prompt: PromptApi) => {
      if (!token) return;
      try {
        await navigator.clipboard.writeText(prompt.content);
        setCopiedId(prompt.id);
        setTimeout(() => setCopiedId(null), 2000);
        await recordPromptUse(token, prompt.id);
        refetchPrompts();
      } catch {
        // ignore
      }
    },
    [token, refetchPrompts]
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
    setTemplateMode(false);
    setDrawerOpen("prompt");
  }, []);

  const openImportPrompt = useCallback(() => {
    setDrawerOpen("import");
  }, []);

  const openCreateTemplate = useCallback(() => {
    setEditingPrompt(null);
    setTemplateMode(true);
    setDrawerOpen("prompt");
  }, []);

  const PAGE_SIZE = 5;
  const totalPrompts = prompts?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalPrompts / PAGE_SIZE));
  const currentPage = totalPages <= 0 ? 0 : Math.min(listPage, totalPages - 1);
  const promptsToShow = (prompts ?? []).slice(
    currentPage * PAGE_SIZE,
    currentPage * PAGE_SIZE + PAGE_SIZE
  );

  useEffect(() => {
    setListPage(0);
  }, [listParams]);

  return (
    <div className="flex h-full min-h-0 min-w-0 max-h-[100vh] flex-col overflow-hidden">
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

      <div className="flex h-[calc(100vh-14rem)] min-h-0 min-w-0 flex-1 gap-4 overflow-hidden">
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
        <div className="flex min-h-0 min-w-0 flex-1 gap-4 overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            <PromptList
              prompts={promptsToShow}
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
              onSelect={(p) => {
                setSelectedId(p.id);
                setFullViewPrompt(p);
              }}
              onOpenFullView={(p) => setFullViewPrompt(p)}
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
              pagination={
                totalPrompts > PAGE_SIZE
                  ? {
                      page: currentPage,
                      pageSize: PAGE_SIZE,
                      total: totalPrompts,
                      onPageChange: setListPage,
                    }
                  : undefined
              }
            />
          </div>
          <div className="hidden min-h-0 min-w-0 shrink-0 flex-col overflow-hidden lg:flex lg:w-[320px]">
            <PromptDiscoveryPanel
              token={token}
              onRefetch={refetchAll}
              onNewPrompt={openCreatePrompt}
              onImportPrompt={openImportPrompt}
              onCreateTemplate={openCreateTemplate}
            />
          </div>
        </div>
      </div>

      <PromptFullViewModal
        prompt={fullViewPrompt}
        open={fullViewPrompt != null}
        onClose={() => setFullViewPrompt(null)}
        onEdit={() => {
          if (fullViewPrompt) {
            setFullViewPrompt(null);
            handleEdit(fullViewPrompt);
          }
        }}
        onCopy={() => fullViewPrompt && handleCopy(fullViewPrompt)}
        onDuplicate={() => fullViewPrompt && handleDuplicate(fullViewPrompt)}
        onToggleFavorite={() => fullViewPrompt && handleToggleFavorite(fullViewPrompt)}
        onTogglePin={() => fullViewPrompt && handleTogglePin(fullViewPrompt)}
        copied={fullViewPrompt ? copiedId === fullViewPrompt.id : false}
      />
      <ImportPromptDrawer
        open={drawerOpen === "import"}
        onClose={() => setDrawerOpen(null)}
        token={token}
        onSuccess={refetchAll}
      />
      <PromptFormDrawer
        open={drawerOpen === "prompt"}
        onClose={() => {
          setDrawerOpen(null);
          setEditingPrompt(null);
          setTemplateMode(false);
        }}
        prompt={editingPrompt}
        initialTitle={templateMode ? t("newTemplateTitle") : undefined}
        folders={folders}
        categories={categories}
        projects={projects}
        tagSuggestions={tagSuggestions}
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
