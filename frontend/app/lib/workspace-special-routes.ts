import type { WorkspaceApi } from "./workspaces-api";

const DEVELOPER_CODES = new Set(["programmer", "programador"]);
const UNIVERSITY_CODES = new Set(["university"]);

function getSubtypeCode(workspace: WorkspaceApi): string | null {
  const snakeCaseSubtype = (workspace as { workspace_subtype?: { code?: string } }).workspace_subtype?.code;
  const value = workspace.workspaceSubtype?.code ?? snakeCaseSubtype;
  return value?.toLowerCase?.() ?? null;
}

export function getSpecialWorkspaceRoute(workspace: WorkspaceApi): string | null {
  const subtypeCode = getSubtypeCode(workspace);
  if (subtypeCode && DEVELOPER_CODES.has(subtypeCode)) return "/workspace/developer";
  const isStudyWorkspace =
    workspace.workspaceType === "study" || workspace.workspaceType === "university";
  const isUniversitySubtype = subtypeCode ? UNIVERSITY_CODES.has(subtypeCode) : false;
  // While University is the only study subtype available, route study workspaces to University OS by default.
  if (isStudyWorkspace && (isUniversitySubtype || !subtypeCode)) {
    return `/workspace/university/${workspace.id}`;
  }
  return null;
}
