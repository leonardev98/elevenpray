export type VaultCategory =
  | "environment"
  | "ssh"
  | "apis"
  | "databases"
  | "cloud"
  | "tokens"
  | "localSetup";

export interface VaultItem {
  id: string;
  title: string;
  value: string;
  maskedValue: string;
  description?: string;
  category: VaultCategory;
  tags: string[];
  projectId?: string;
  favorite: boolean;
  createdAt: string;
  lastUsed?: string;
}

export type PromptCategoryCode =
  | "debugging"
  | "refactor"
  | "testing"
  | "architecture"
  | "sql"
  | "codeReview"
  | "ui"
  | "documentation"
  | "devops"
  | "apiDesign";

/** Legacy alias for mock compatibility */
export type PromptCategory = PromptCategoryCode;

export interface PromptCategoryApi {
  id: string;
  code: string;
  name: string | null;
  createdAt: string;
}

export interface PromptFolderApi {
  id: string;
  userId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeveloperProjectApi {
  id: string;
  userId: string;
  name: string;
  repositoryName: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromptTagApi {
  id: string;
  name: string;
  createdAt: string;
}

export type PromptStatus = "active" | "archived" | "draft";

export interface PromptApi {
  id: string;
  userId: string;
  folderId: string | null;
  categoryId: string | null;
  projectId: string | null;
  title: string;
  slug: string | null;
  description: string | null;
  content: string;
  promptType: string | null;
  status: PromptStatus;
  repositoryName: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  folder?: PromptFolderApi | null;
  category?: PromptCategoryApi | null;
  project?: DeveloperProjectApi | null;
  tags?: PromptTagApi[];
}

/** Legacy Prompt shape for backward compatibility (maps to PromptApi in UI) */
export interface Prompt {
  id: string;
  title: string;
  description: string;
  content: string;
  category: PromptCategory;
  tags: string[];
  favorite: boolean;
  projectId?: string;
  createdAt: string;
}

export interface Snippet {
  id: string;
  title: string;
  language: string;
  description: string;
  content: string;
  tags: string[];
  favorite: boolean;
  lastUsed?: string;
  timesUsed?: number;
}

export type TaskStatus = "todo" | "inProgress" | "done";

export interface Task {
  id: string;
  title: string;
  priority: "low" | "medium" | "high";
  tag?: string;
  status: TaskStatus;
  projectId?: string;
  dueToday: boolean;
  dueAt?: string;
}

export interface Project {
  id: string;
  name: string;
  stack: string[];
  status: "active" | "paused" | "archived";
  lastAccessed: string;
  badges?: string[];
}

export type TechFeedCategory =
  | "frontend"
  | "backend"
  | "ai"
  | "devops"
  | "cloud"
  | "openSource"
  | "design";

export interface TechFeedItem {
  id: string;
  title: string;
  source: string;
  tag: TechFeedCategory;
  time: string;
  url?: string;
}

export type NoteType =
  | "idea"
  | "command"
  | "debugNote"
  | "architectureThought"
  | "meetingTakeaway"
  | "todoThought"
  | "promptDraft";

export interface Note {
  id: string;
  type: NoteType;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  projectId?: string;
}

export interface ProfileCategory {
  id: string;
  name: string;
  items: string[];
}
