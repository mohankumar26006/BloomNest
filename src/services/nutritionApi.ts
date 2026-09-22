import { NutritionAiResult, RecipeAiResult } from "../types";
import { apiFetch } from "./apiClient";

export async function askNutritionAI(
  query: string,
  trimester?: number
): Promise<NutritionAiResult> {
  const res = await apiFetch("/api/nutrition/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, trimester }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(
      errData.error || "Unable to get AI nutrition guidance right now. Please check server connection and retry."
    );
  }

  const data = await res.json();
  if (!data.success || !data.result) {
    throw new Error("Received malformed AI nutrition response.");
  }

  return data.result as NutritionAiResult;
}

export async function fetchRecipeAI(
  dishName: string,
  trimester?: number
): Promise<RecipeAiResult> {
  const res = await apiFetch("/api/nutrition/recipe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dishName, trimester }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(
      errData.error || "We couldn't generate a reliable recipe right now."
    );
  }

  const data = await res.json();
  if (!data.success || !data.result) {
    throw new Error("Received malformed AI recipe response.");
  }

  return data.result as RecipeAiResult;
}
