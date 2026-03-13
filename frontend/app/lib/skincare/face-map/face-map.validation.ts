/**
 * Client-side validation for face map marker forms. Use before submitting to API.
 */

import type { IssueType, Severity } from "./face-map.types";
import { ISSUE_TYPES, SEVERITIES, NOTES_MAX_LENGTH } from "./face-map.constants";

export interface MarkerFormErrors {
  issueType?: string;
  severity?: string;
  notes?: string;
  x?: string;
  y?: string;
  photoUrl?: string;
}

export function validateCreateMarker(dto: {
  issueType?: string;
  severity?: string;
  notes?: string | null;
  x?: number;
  y?: number;
  photoUrl?: string | null;
}): MarkerFormErrors {
  const errors: MarkerFormErrors = {};
  if (
    dto.issueType === undefined ||
    dto.issueType === "" ||
    !ISSUE_TYPES.includes(dto.issueType as IssueType)
  ) {
    errors.issueType = "Selecciona un tipo de problema";
  }
  if (
    dto.severity === undefined ||
    dto.severity === "" ||
    !SEVERITIES.includes(dto.severity as Severity)
  ) {
    errors.severity = "Selecciona una severidad";
  }
  if (dto.notes != null && dto.notes.length > NOTES_MAX_LENGTH) {
    errors.notes = `Máximo ${NOTES_MAX_LENGTH} caracteres`;
  }
  if (typeof dto.x !== "number" || !Number.isFinite(dto.x) || dto.x < 0 || dto.x > 100) {
    errors.x = "Coordenada inválida";
  }
  if (typeof dto.y !== "number" || !Number.isFinite(dto.y) || dto.y < 0 || dto.y > 100) {
    errors.y = "Coordenada inválida";
  }
  if (dto.photoUrl != null && dto.photoUrl.trim() !== "" && !isValidUrl(dto.photoUrl.trim())) {
    errors.photoUrl = "URL no válida";
  }
  return errors;
}

function isValidUrl(s: string): boolean {
  try {
    new URL(s);
    return true;
  } catch {
    return false;
  }
}

export function hasValidationErrors(errors: MarkerFormErrors): boolean {
  return Object.keys(errors).length > 0;
}
