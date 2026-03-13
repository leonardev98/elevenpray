/**
 * Workspace navigation config.
 * Defines main sections (max 6) and optional sub-sections per workspace type.
 * Used by WorkspaceNav and WorkspaceSubNav.
 */

export interface NavChild {
  href: string;
  labelKey: string;
}

export interface NavSection {
  id: string;
  labelKey: string;
  icon: string;
  /** Path relative to workspace base, e.g. "" for overview, "routine" for /routine */
  href: string;
  children?: NavChild[];
}

const SKINCARE_SECTIONS: NavSection[] = [
  {
    id: "overview",
    labelKey: "overview",
    icon: "home",
    href: "",
    children: undefined,
  },
  {
    id: "routine",
    labelKey: "routine",
    icon: "droplets",
    href: "routine",
    children: undefined,
  },
  {
    id: "skin",
    labelKey: "skin",
    icon: "scan",
    href: "journal",
    children: [
      { href: "journal", labelKey: "journal" },
      { href: "photos", labelKey: "photos" },
      { href: "progress", labelKey: "progress" },
      { href: "face", labelKey: "faceMapping" },
    ],
  },
  {
    id: "products",
    labelKey: "products",
    icon: "flask",
    href: "products",
    children: [
      { href: "products", labelKey: "myProducts" },
      { href: "library", labelKey: "catalog" },
      { href: "conflicts", labelKey: "conflicts" },
    ],
  },
  {
    id: "learn",
    labelKey: "learn",
    icon: "book",
    href: "knowledge",
    children: [
      { href: "knowledge", labelKey: "articles" },
      { href: "videos", labelKey: "videos" },
    ],
  },
  {
    id: "experts",
    labelKey: "experts",
    icon: "user",
    href: "experts",
    children: undefined,
  },
];

import { getWorkspaceType } from "./workspace-type-registry";

/**
 * Fallback: build flat nav from capabilities for types without explicit config.
 */
function buildFallbackSections(typeId: string): NavSection[] {
  const def = getWorkspaceType(typeId);
  if (!def) return [];

  const caps = def.capabilities ?? {};
  const sections: NavSection[] = [
    { id: "overview", labelKey: "overview", icon: "home", href: "" },
  ];
  if (caps.hasRoutine) {
    sections.push({ id: "routine", labelKey: "routine", icon: "droplets", href: "routine" });
  }
  if (caps.hasProductVault) {
    sections.push({ id: "products", labelKey: "products", icon: "flask", href: "products" });
  }
  if (caps.hasCheckins) {
    sections.push({ id: "journal", labelKey: "journal", icon: "scan", href: "journal" });
  }
  if (caps.hasProgressPhotos) {
    sections.push({ id: "photos", labelKey: "photos", icon: "scan", href: "photos" });
  }
  if (caps.hasKnowledgeHub || caps.hasVideoGuides) {
    sections.push({
      id: "learn",
      labelKey: "learn",
      icon: "book",
      href: caps.hasKnowledgeHub ? "knowledge" : "videos",
    });
  }
  if (caps.hasExpertConsultation) {
    sections.push({ id: "experts", labelKey: "experts", icon: "user", href: "experts" });
  }
  return sections;
}

/**
 * Returns nav sections for the given workspace type (max 6 main sections).
 * Skincare uses the grouped config; other types get a capability-based fallback.
 */
export function getWorkspaceNavSections(workspaceTypeId: string): NavSection[] {
  if (workspaceTypeId === "skincare") {
    return SKINCARE_SECTIONS.slice(0, 6);
  }
  return buildFallbackSections(workspaceTypeId).slice(0, 6);
}

/**
 * Resolves which main section is active for the current pathname.
 * pathname is the full path e.g. /dashboard/workspaces/abc/journal
 * base is e.g. /dashboard/workspaces/abc
 */
export function getActiveSection(
  sections: NavSection[],
  pathname: string,
  base: string
): NavSection | undefined {
  const relative = pathname === base ? "" : pathname.slice(base.length + 1).split("/")[0] ?? "";
  for (const section of sections) {
    if (section.href === relative) return section;
    if (section.children?.some((c) => c.href === relative)) return section;
  }
  return undefined;
}
