"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { WorkspaceApi } from "../../../../lib/workspaces-api";
import { getWorkspaces, createWorkspace, deleteWorkspace } from "../../../../lib/workspaces-api";
import type { WorkspaceTypeId } from "./topic-types";
import { toast } from "../../../../lib/toast";

interface WorkspacesContextValue {
  workspaces: WorkspaceApi[];
  isLoading: boolean;
  error: string | null;
  addWorkspace: (name: string, workspaceType: WorkspaceTypeId, workspaceSubtypeId?: string | null) => Promise<void>;
  removeWorkspace: (id: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspacesContext = createContext<WorkspacesContextValue | null>(null);

export function WorkspacesProvider({ children, token }: { children: React.ReactNode; token: string | null }) {
  const [workspaces, setWorkspaces] = useState<WorkspaceApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("workspace");

  const refreshWorkspaces = useCallback(async () => {
    if (!token) {
      setWorkspaces([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWorkspaces(token);
      setWorkspaces(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar workspaces");
      setWorkspaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  const addWorkspace = useCallback(
    async (name: string, workspaceType: WorkspaceTypeId, workspaceSubtypeId?: string | null) => {
      if (!token) return;
      setError(null);
      try {
        const created = await createWorkspace(token, name, workspaceType, workspaceSubtypeId);
        setWorkspaces((prev) => [...prev, created]);
        const displayName = (name?.trim() || created.name?.trim()) || t("spaceUnnamed");
        toast.success(t("spaceCreatedTitle"), t("spaceCreatedMessage", { name: displayName }));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Error al crear workspace";
        setError(msg);
        toast.error(t("errorCreateTitle"), msg);
        throw e;
      }
    },
    [token, t]
  );

  const removeWorkspace = useCallback(
    async (id: string) => {
      if (!token) return;
      setError(null);
      const previous = workspaces;
      setWorkspaces((prev) => prev.filter((w) => w.id !== id));
      try {
        await deleteWorkspace(token, id);
        toast.success(t("spaceDeletedTitle"), t("spaceDeletedMessage"));
      } catch (e) {
        setWorkspaces(previous);
        const message = e instanceof Error ? e.message : "Error al eliminar workspace";
        setError(message);
        toast.error(t("errorDeleteTitle"), message);
        throw e;
      }
    },
    [token, workspaces, t]
  );

  return (
    <WorkspacesContext.Provider
      value={{ workspaces, isLoading, error, addWorkspace, removeWorkspace, refreshWorkspaces }}
    >
      {children}
    </WorkspacesContext.Provider>
  );
}

export function useWorkspaces(): WorkspacesContextValue {
  const ctx = useContext(WorkspacesContext);
  if (!ctx) throw new Error("useWorkspaces must be used within WorkspacesProvider");
  return ctx;
}
