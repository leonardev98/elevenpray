"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  PromptApi,
  PromptFolderApi,
  PromptCategoryApi,
  DeveloperProjectApi,
  PromptTagApi,
} from "../types";
import type { ListPromptsParams, CreatePromptBody, UpdatePromptBody } from "../api/prompts-api";
import * as api from "../api/prompts-api";

export function usePrompts(token: string | null, params: ListPromptsParams = {}) {
  const [data, setData] = useState<PromptApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!token) {
      setData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const list = await api.listPrompts(token, params);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load prompts"));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, JSON.stringify(params)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function usePrompt(token: string | null, id: string | null) {
  const [data, setData] = useState<PromptApi | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!token || !id) {
      setData(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const prompt = await api.getPrompt(token, id);
      setData(prompt);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load prompt"));
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [token, id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function usePromptFolders(token: string | null) {
  const [data, setData] = useState<PromptFolderApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!token) {
      setData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const list = await api.listPromptFolders(token);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load folders"));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function usePromptCategories(token: string | null) {
  const [data, setData] = useState<PromptCategoryApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!token) {
      setData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const list = await api.listPromptCategories(token);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load categories"));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function useDeveloperProjects(token: string | null) {
  const [data, setData] = useState<DeveloperProjectApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!token) {
      setData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const list = await api.listDeveloperProjects(token);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load projects"));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

export function usePromptTags(token: string | null, search?: string) {
  const [data, setData] = useState<PromptTagApi[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    if (!token) {
      setData([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const list = await api.listPromptTags(token, search);
      setData(list);
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Failed to load tags"));
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, search]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

// Re-export API for mutations (call from components with token + refetch after)
export {
  createPrompt,
  updatePrompt,
  deletePrompt,
  duplicatePrompt,
  setPromptFavorite,
  setPromptPinned,
  archivePrompt,
  unarchivePrompt,
  recordPromptUse,
  createPromptFolder,
  updatePromptFolder,
  deletePromptFolder,
  createDeveloperProject,
  updateDeveloperProject,
  deleteDeveloperProject,
  createPromptTag,
} from "../api/prompts-api";
export type { CreatePromptBody, UpdatePromptBody, ListPromptsParams } from "../api/prompts-api";
