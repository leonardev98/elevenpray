import { getAuthHeaders, getBaseUrl } from "../api";

export interface ReferralSummaryDto {
  codigo: string;
  activados: number;
  usosEstaSemana: number;
  codigoReferidor: string | null;
  puedeAplicarCodigo: boolean;
}

export async function getReferralSummary(token: string): Promise<ReferralSummaryDto> {
  const res = await fetch(`${getBaseUrl()}/referrals/summary`, {
    headers: getAuthHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Error al cargar referidos");
  }
  return res.json();
}

export async function applyReferralCode(
  token: string,
  code: string,
): Promise<ReferralSummaryDto> {
  const res = await fetch(`${getBaseUrl()}/referrals/apply`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ code }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? "Error al activar código");
  }
  return res.json();
}
