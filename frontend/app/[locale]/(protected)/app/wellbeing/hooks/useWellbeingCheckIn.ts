"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import {
  getTodayEmotionalCheckIn,
  upsertTodayEmotionalCheckIn,
} from "@/app/lib/emotional-checkins-api";
import { useCheckIn } from "../../components/check-in-context";
import { getTodayCheckIn, saveTodayCheckIn } from "../../lib/student-storage";
import type { MoodFactorId, MoodId } from "../wellbeing-types";

const MOOD_IDS: MoodId[] = ["excellent", "good", "normal", "low", "bad"];
const FACTOR_IDS: MoodFactorId[] = [
  "sleepGood",
  "sleepBad",
  "examNear",
  "heavyLoad",
  "calmDay",
  "personalIssues",
];

const VISIBLE_FACTORS: MoodFactorId[] = [
  "sleepGood",
  "sleepBad",
  "examNear",
  "heavyLoad",
  "calmDay",
  "personalIssues",
];

function isMoodId(value: string): value is MoodId {
  return MOOD_IDS.includes(value as MoodId);
}

function isMoodFactorId(value: string): value is MoodFactorId {
  return FACTOR_IDS.includes(value as MoodFactorId);
}

export function useWellbeingCheckIn() {
  const { token, user } = useAuth();
  const { refreshCheckIn } = useCheckIn();
  const userId = user?.id;

  const [selectedMood, setSelectedMood] = useState<MoodId | null>(null);
  const [factors, setFactors] = useState<MoodFactorId[]>([]);
  const [note, setNote] = useState("");
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const migratedRef = useRef(false);

  const applyLocal = useCallback((mood: MoodId, noteValue: string, factorValues: MoodFactorId[]) => {
    setSelectedMood(mood);
    setNote(noteValue);
    setFactors(factorValues);
    setHasCheckedInToday(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const local = getTodayCheckIn(userId);
      let mood: MoodId | null = null;
      let noteValue = "";
      let factorValues: MoodFactorId[] = [];

      if (local && isMoodId(local.mood)) {
        mood = local.mood;
        noteValue = local.note ?? "";
        factorValues = (local.factors ?? []).filter(isMoodFactorId);
      }

      if (token) {
        try {
          const remote = await getTodayEmotionalCheckIn(token);
          if (!cancelled && remote) {
            mood = remote.mood;
            noteValue = remote.note ?? "";
            factorValues = remote.factors.filter(isMoodFactorId);
            saveTodayCheckIn(mood, noteValue, factorValues, userId);
          } else if (
            !cancelled &&
            !remote &&
            mood &&
            !migratedRef.current
          ) {
            migratedRef.current = true;
            try {
              await upsertTodayEmotionalCheckIn(token, {
                mood,
                factors: factorValues,
                note: noteValue || undefined,
              });
            } catch {
              /* offline */
            }
          }
        } catch {
          /* use local */
        }
      }

      if (!cancelled && mood) {
        applyLocal(mood, noteValue, factorValues);
      }
      if (!cancelled) setHydrated(true);
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [userId, token, applyLocal]);

  const persistCheckIn = useCallback(
    async (mood: MoodId, noteValue: string, factorValues: MoodFactorId[]) => {
      setSaving(true);
      setSaveError(null);
      saveTodayCheckIn(mood, noteValue, factorValues, userId);

      if (token) {
        try {
          await upsertTodayEmotionalCheckIn(token, {
            mood,
            factors: factorValues,
            note: noteValue.trim() || undefined,
          });
        } catch (e) {
          setSaveError(e instanceof Error ? e.message : "Error al guardar");
          setSaving(false);
          return false;
        }
      }

      setHasCheckedInToday(true);
      refreshCheckIn();
      setSaving(false);
      setSavedFlash(true);
      setIsEditing(false);
      setTimeout(() => setSavedFlash(false), 2500);
      return true;
    },
    [userId, token, refreshCheckIn],
  );

  const selectMood = useCallback((mood: MoodId) => {
    setSelectedMood(mood);
    setSavedFlash(false);
  }, []);

  const toggleFactor = useCallback((factorId: MoodFactorId) => {
    setFactors((prev) => {
      const exists = prev.includes(factorId);
      if (exists) return prev.filter((f) => f !== factorId);
      return [...prev, factorId];
    });
    setSavedFlash(false);
  }, []);

  const updateNote = useCallback((value: string) => {
    setNote(value);
    setSavedFlash(false);
  }, []);

  const saveCheckIn = useCallback(async () => {
    if (!selectedMood) return false;
    return persistCheckIn(selectedMood, note, factors);
  }, [selectedMood, note, factors, persistCheckIn]);

  const startEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const stopEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  return {
    selectedMood,
    factors,
    note,
    hasCheckedInToday,
    hydrated,
    saving,
    savedFlash,
    saveError,
    isEditing,
    visibleFactors: VISIBLE_FACTORS,
    selectMood,
    toggleFactor,
    updateNote,
    saveCheckIn,
    startEditing,
    stopEditing,
  };
}
