"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Topic, TopicTypeId } from "./topic-types";
import { getTopics, createTopic, deleteTopic } from "../../../lib/topics-api";

const TOPICS_KEY = "elevenpray_topics";

interface TopicsContextValue {
  topics: Topic[];
  isLoading: boolean;
  error: string | null;
  addTopic: (title: string, type: TopicTypeId) => Promise<void>;
  removeTopic: (id: string) => Promise<void>;
  refreshTopics: () => Promise<void>;
}

const TopicsContext = createContext<TopicsContextValue | null>(null);

function toTopic(t: { id: string; title: string; type: string; sortOrder?: number; createdAt: string }): Topic {
  return {
    id: t.id,
    title: t.title,
    type: t.type as TopicTypeId,
    sortOrder: t.sortOrder,
    createdAt: t.createdAt,
  };
}

export function TopicsProvider({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string | null;
}) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTopics = useCallback(async () => {
    if (!token) {
      try {
        const raw = localStorage.getItem(TOPICS_KEY);
        if (raw) setTopics(JSON.parse(raw));
        else setTopics([]);
      } catch {
        setTopics([]);
      }
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTopics(token);
      setTopics(data.map(toTopic));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar tópicos");
      setTopics([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshTopics();
  }, [refreshTopics]);

  useEffect(() => {
    if (!token && topics.length > 0) {
      localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
    }
  }, [token, topics]);

  const addTopic = useCallback(
    async (title: string, type: TopicTypeId) => {
      if (!token) {
        setTopics((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            title: title.trim() || "Sin título",
            type,
            createdAt: Date.now(),
          },
        ]);
        return;
      }
      setError(null);
      try {
        const created = await createTopic(token, title, type);
        setTopics((prev) => [...prev, toTopic(created)]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al crear tópico");
        throw e;
      }
    },
    [token]
  );

  const removeTopic = useCallback(
    async (id: string) => {
      if (!token) {
        setTopics((prev) => prev.filter((t) => t.id !== id));
        return;
      }
      setError(null);
      try {
        await deleteTopic(token, id);
        setTopics((prev) => prev.filter((t) => t.id !== id));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al eliminar tópico");
        throw e;
      }
    },
    [token]
  );

  return (
    <TopicsContext.Provider
      value={{ topics, isLoading, error, addTopic, removeTopic, refreshTopics }}
    >
      {children}
    </TopicsContext.Provider>
  );
}

export function useTopics(): TopicsContextValue {
  const ctx = useContext(TopicsContext);
  if (!ctx) throw new Error("useTopics must be used within TopicsProvider");
  return ctx;
}
