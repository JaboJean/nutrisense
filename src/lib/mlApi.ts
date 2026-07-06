/**
 * ML prediction API client.
 *
 * When VITE_ML_API_URL is set (e.g. http://localhost:8000) all calls go to the
 * real FastAPI backend.  Without it the mock formulae run locally so the UI
 * stays usable during frontend-only development.
 */

import { FOOD_DATABASE, type LogItem } from "@/data/mock";
import type { UserProfile } from "@/hooks/useProfile";

const ML_API_URL = (import.meta.env.VITE_ML_API_URL as string | undefined)?.replace(/\/$/, "");

// ── Shared types (mirror FastAPI response schema exactly) ─────────────────────

export interface RiskScores {
  anemia:     number; // 0–100
  diabetes:   number;
  overweight: number;
  overall:    number;
}

export interface ShapEntry {
  f: string;
  v: number;
  label?: string;
}

export interface Prediction {
  scores: RiskScores;
  shap: {
    anemia:     ShapEntry[];
    diabetes:   ShapEntry[];
    overweight: ShapEntry[];
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function predictRisk(
  logs: LogItem[],
  profile?: UserProfile | null,
): Promise<Prediction> {
  if (ML_API_URL) {
    const res = await fetch(`${ML_API_URL}/api/predict/risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        logs: logs.map((l) => ({ name: l.name, meal: l.meal })),
        profile: profile
          ? {
              age:      profile.age,
              sex:      profile.sex,
              weightKg: profile.weightKg,
              heightCm: profile.heightCm,
            }
          : undefined,
      }),
    });
    if (!res.ok) throw new Error(`Risk API error ${res.status}`);
    const data = await res.json() as Prediction;
    // Cap at 97 — XGBoost can output extreme probabilities near 1.0 on boundary inputs;
    // displaying 100% implies certainty the model doesn't claim.
    for (const k of ["anemia", "diabetes", "overweight"] as const) {
      data.scores[k] = Math.min(97, data.scores[k]);
    }
    data.scores.overall = Math.min(97, data.scores.overall);
    return data;
  }

  // ── Mock fallback ─────────────────────────────────────────────────────────
  await new Promise((r) => setTimeout(r, 320));
  if (logs.length === 0) return baseline();

  let iron = 0, kcal = 0, fiber = 0, protein = 0, vitC = 0, matched = 0;
  for (const log of logs) {
    const food = FOOD_DATABASE.find(
      (f) => f.name.toLowerCase() === log.name.toLowerCase(),
    );
    if (food) {
      iron    += food.iron;
      kcal    += food.kcal;
      fiber   += food.fiber;
      protein += food.protein;
      vitC    += food.vitC;
      matched++;
    } else {
      // Food not in local DB — parse what we can from the meta string
      const kcalMatch = log.meta?.match(/(\d+(?:\.\d+)?)\s*kcal/i);
      const ironMatch = log.meta?.match(/(\d+(?:\.\d+)?)\s*mg\s*iron/i);
      if (kcalMatch || ironMatch) {
        if (kcalMatch) kcal += parseFloat(kcalMatch[1]);
        if (ironMatch) iron += parseFloat(ironMatch[1]);
        matched++;
      }
    }
  }
  if (matched === 0) return baseline();

  const anemia     = clamp(82 - iron * 2.8 - vitC * 0.4, 8, 92);
  const diabetes   = clamp(66 - fiber * 3.8 - protein * 0.45 + (kcal > 900 ? 12 : 0), 8, 92);
  const overweight = clamp(12 + kcal * 0.028, 8, 92);
  const overall    = (anemia + diabetes + overweight) / 3;

  return {
    scores: {
      anemia:     Math.round(anemia),
      diabetes:   Math.round(diabetes),
      overweight: Math.round(overweight),
      overall:    Math.round(overall),
    },
    shap: {
      anemia:     [{ f: "Iron intake", v: -(iron * 0.28) }, { f: "Vitamin C", v: -(vitC * 0.04) }],
      diabetes:   [{ f: "Dietary fibre", v: -(fiber * 0.38) }, { f: "Caloric load", v: kcal * 0.009 }],
      overweight: [{ f: "Total calories", v: kcal * 0.014 }, { f: "Protein", v: -(protein * 0.11) }],
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function baseline(): Prediction {
  return {
    scores: { anemia: 45, diabetes: 38, overweight: 42, overall: 42 },
    shap: {
      anemia:     [{ f: "No meals logged", v: 0 }],
      diabetes:   [{ f: "No meals logged", v: 0 }],
      overweight: [{ f: "No meals logged", v: 0 }],
    },
  };
}
