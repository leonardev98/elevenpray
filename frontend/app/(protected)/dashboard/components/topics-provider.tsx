"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Topic, TopicTypeId } from "./topic-types";

const TOPICS_KEY = "elevenpray_topics";

interface TopicsContextValue {
  topics: Topic[];
  addTopic: (title: string, type: TopicTypeId) => void;
  removeTopic: (id: string) => void;
}

const TopicsContext = createContext<TopicsContextValue | null>(null);

export function TopicsProvider({ children }: { children: React.ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TOPICS_KEY);
      if (raw) setTopics(JSON.parse(raw));
    } catch {
      setTopics([]);
    }
  }, []);

  useEffect(() => {
    if (topics.length === 0) return;
    localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
  }, [topics]);

  const addTopic = useCallback((title: string, type: TopicTypeId) => {
    setTopics((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: title.trim() || "Sin título", type, createdAt: Date.now() },
    ]);
  }, []);

  const removeTopic = useCallback((id: string) => {
    setTopics((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <TopicsContext.Provider value={{ topics, addTopic, removeTopic }}>
      {children}
    </TopicsContext.Provider>
  );
}

export function useTopics(): TopicsContextValue {
  const ctx = useContext(TopicsContext);
  if (!ctx) throw new Error("useTopics must be used within TopicsProvider");
  return ctx;
}
