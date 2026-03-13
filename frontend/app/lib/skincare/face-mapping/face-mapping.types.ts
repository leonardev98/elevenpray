/**
 * Types for Skin Face Mapping feature.
 * Aligned with backend entities and DTOs.
 */

export type FaceModelType = "female" | "male";

export type IssueType =
  | "acne"
  | "blackheads"
  | "redness"
  | "pigmentation"
  | "dryness"
  | "irritation"
  | "scar"
  | "sensitivity"
  | "pore-congestion"
  | "custom";

export type Severity = "mild" | "moderate" | "severe";

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface FaceSessionApi {
  id: string;
  workspaceId: string;
  sessionDate: string;
  faceModelType: FaceModelType;
  createdAt: string;
  updatedAt: string;
}

export interface FaceMarkerApi {
  id: string;
  workspaceId: string;
  sessionId: string | null;
  faceModelType: FaceModelType;
  issueType: IssueType;
  severity: Severity;
  notes: string | null;
  x: number;
  y: number;
  z: number;
  regionLabel: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionDto {
  sessionDate: string;
  faceModelType: FaceModelType;
}

export interface CreateMarkerDto {
  issueType: IssueType;
  severity: Severity;
  notes?: string | null;
  x: number;
  y: number;
  z: number;
  regionLabel?: string | null;
  photoUrl?: string | null;
  sessionId?: string | null;
  faceModelType: FaceModelType;
}

export interface UpdateMarkerDto {
  issueType?: IssueType;
  severity?: Severity;
  notes?: string | null;
  regionLabel?: string | null;
  photoUrl?: string | null;
}
