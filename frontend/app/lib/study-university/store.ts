import { create } from "zustand";
import type { UniversityWorkspaceState } from "./types";
import { UNIVERSITY_WORKSPACE_EMPTY_STATE } from "./mock-data";

interface UniversityWorkspaceStore {
  state: UniversityWorkspaceState;
  selectedSessionId: string | null;
  onboardingOpen: boolean;
  createCourseOpen: boolean;
  setState: (next: UniversityWorkspaceState) => void;
  setSelectedSessionId: (sessionId: string | null) => void;
  setOnboardingOpen: (open: boolean) => void;
  setCreateCourseOpen: (open: boolean) => void;
}

export const useUniversityWorkspaceStore = create<UniversityWorkspaceStore>((set) => ({
  state: UNIVERSITY_WORKSPACE_EMPTY_STATE,
  selectedSessionId: null,
  onboardingOpen: false,
  createCourseOpen: false,
  setState: (next) => set({ state: next }),
  setSelectedSessionId: (selectedSessionId) => set({ selectedSessionId }),
  setOnboardingOpen: (onboardingOpen) => set({ onboardingOpen }),
  setCreateCourseOpen: (createCourseOpen) => set({ createCourseOpen }),
}));
