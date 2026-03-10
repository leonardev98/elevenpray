import { getBaseUrl, getAuthHeaders } from "./api";

export interface ConflictResultApi {
  ingredientA: string;
  ingredientB: string;
  severity: "warning" | "danger";
  message: string;
}

export async function checkIngredientConflicts(
  token: string,
  ingredients: string[],
  locale?: "es" | "en"
): Promise<ConflictResultApi[]> {
  const search = locale ? `?locale=${locale}` : "";
  const res = await fetch(`${getBaseUrl()}/ingredient-conflicts/check${search}`, {
    method: "POST",
    headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients }),
  });
  if (!res.ok) throw new Error("Error al comprobar conflictos");
  return res.json();
}
