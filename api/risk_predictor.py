"""
XGBoost risk predictor — loads nutrisense_model.joblib once at startup,
exposes predict(features, logs) -> Prediction dict.
"""
import os
from pathlib import Path

import joblib
import numpy as np
import shap

from nutrition_db import get as get_nutrition

MODEL_DIR   = Path(os.getenv("MODEL_DIR", Path(__file__).parent))
BUNDLE_PATH = MODEL_DIR / "nutrisense_model.joblib"
HF_REPO     = "JeanJabo/nutrisense-api"


def _ensure_bundle():
    """Download the model bundle from HuggingFace Hub if not present locally."""
    if not BUNDLE_PATH.exists():
        print(f"Downloading nutrisense_model.joblib from {HF_REPO} ...")
        from huggingface_hub import hf_hub_download
        hf_hub_download(
            repo_id=HF_REPO,
            repo_type="space",
            filename="nutrisense_model.joblib",
            local_dir=str(MODEL_DIR),
        )
        print("Download complete.")

FEATURES = [
    "age", "sex",
    "energy_kcal", "protein_g", "fat_g", "carb_g",
    "iron_mg", "vitC_mg", "vitA_mcg",
    "fiber_g", "sugar_g",
    "calcium_mg", "zinc_mg", "sodium_mg",
]

FEATURE_LABELS = {
    "age":        "Age",
    "sex":        "Sex",
    "energy_kcal":"Caloric intake",
    "protein_g":  "Protein",
    "fat_g":      "Fat",
    "carb_g":     "Carbohydrates",
    "iron_mg":    "Iron intake",
    "vitC_mg":    "Vitamin C",
    "vitA_mcg":   "Vitamin A",
    "fiber_g":    "Dietary fibre",
    "sugar_g":    "Sugar load",
    "calcium_mg": "Calcium",
    "zinc_mg":    "Zinc",
    "sodium_mg":  "Sodium",
}


class RiskPredictor:
    def __init__(self) -> None:
        _ensure_bundle()
        bundle = joblib.load(BUNDLE_PATH)
        self.models     = bundle["models"]       # {disease: Pipeline}
        self.explainers = bundle["explainers"]   # {disease: TreeExplainer}
        self.thresholds = bundle["thresholds"]

    def predict(
        self,
        logs: list[dict],          # list of {name: str, ...}
        age: float,
        sex: str,                  # "male" | "female"
    ) -> dict:
        """
        Returns:
        {
          "scores": {"anemia": int, "diabetes": int, "overweight": int, "overall": int},
          "shap":   {"anemia": [...], "diabetes": [...], "overweight": [...]}
        }
        Each score is 0–100 (probability × 100).
        """
        # Aggregate nutrients from food log
        totals = {k: 0.0 for k in [
            "energy_kcal", "protein_g", "fat_g", "carb_g",
            "iron_mg", "vitC_mg", "vitA_mcg", "fiber_g",
            "sugar_g", "calcium_mg", "zinc_mg", "sodium_mg",
        ]}

        for log in logs:
            n = get_nutrition(log.get("name", "").lower().replace(" ", "_"))
            totals["energy_kcal"] += n["kcal"]
            totals["protein_g"]   += n["protein"]
            totals["fat_g"]       += n["fat"]
            totals["carb_g"]      += n["carb"]
            totals["iron_mg"]     += n["iron"]
            totals["vitC_mg"]     += n["vitC"]
            totals["vitA_mcg"]    += n["vitA"]
            totals["fiber_g"]     += n["fiber"]
            totals["sugar_g"]     += n["sugar"]
            totals["calcium_mg"]  += n["calcium"]
            totals["zinc_mg"]     += n["zinc"]
            totals["sodium_mg"]   += n["sodium"]

        # The model was trained on full-day nutrient totals (mean ~1850 kcal/day).
        # Fewer logged meals = lower totals = the model reads it as extreme deficiency.
        # Scale up to an estimated daily intake so single-meal inputs are comparable
        # to the training distribution. Cap at 3× to avoid over-extrapolating.
        DAILY_KCAL = 1850.0
        logged_kcal = totals["energy_kcal"]
        scale = min(3.0, DAILY_KCAL / logged_kcal) if logged_kcal > 0 else 1.0
        if scale > 1.0:
            for k in totals:
                totals[k] *= scale

        sex_enc = 2.0 if sex == "female" else 1.0
        X = np.array([[
            age, sex_enc,
            totals["energy_kcal"], totals["protein_g"], totals["fat_g"], totals["carb_g"],
            totals["iron_mg"], totals["vitC_mg"], totals["vitA_mcg"],
            totals["fiber_g"], totals["sugar_g"],
            totals["calcium_mg"], totals["zinc_mg"], totals["sodium_mg"],
        ]])

        scores, shap_out = {}, {}
        for disease, pipe in self.models.items():
            prob = float(pipe.predict_proba(X)[0, 1])
            scores[disease] = max(1, round(prob * 100))

            # SHAP on the scaled input
            scaler  = pipe.named_steps["scaler"]
            X_sc    = scaler.transform(X)
            exp     = self.explainers[disease]
            sv      = exp.shap_values(X_sc)           # (1, 14) or (14,)
            sv_row  = np.array(sv).reshape(-1)

            top_idx = np.abs(sv_row).argsort()[::-1][:5]
            shap_out[disease] = [
                {"f": FEATURE_LABELS[FEATURES[i]], "v": round(float(sv_row[i]), 3)}
                for i in top_idx
            ]

        overall = round(sum(scores.values()) / len(scores))
        scores["overall"] = overall

        return {"scores": scores, "shap": shap_out}
