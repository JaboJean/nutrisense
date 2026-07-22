"""
XGBoost / GradientBoosting risk predictor — loads nutrisense_model.joblib
once at startup, exposes predict(logs, age, sex) -> Prediction dict.
"""
import os
from pathlib import Path

import joblib
import numpy as np
import shap

from nutrition_db import get as get_nutrition

MODEL_DIR   = Path(os.getenv("MODEL_DIR", Path(__file__).parent))
BUNDLE_PATH = MODEL_DIR / "nutrisense_model.joblib"
HF_REPO     = "JeanJabo/nutrisense-food-model"   # model repo — 50 GB, no LFS limit


def _ensure_bundle():
    if BUNDLE_PATH.exists():
        return
    print(f"Downloading nutrisense_model.joblib from {HF_REPO} ...")
    from huggingface_hub import hf_hub_download
    hf_hub_download(
        repo_id=HF_REPO,
        repo_type="model",
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
    "age":         "Age",
    "sex":         "Sex",
    "energy_kcal": "Caloric intake",
    "protein_g":   "Protein",
    "fat_g":       "Fat",
    "carb_g":      "Carbohydrates",
    "iron_mg":     "Iron intake",
    "vitC_mg":     "Vitamin C",
    "vitA_mcg":    "Vitamin A",
    "fiber_g":     "Dietary fibre",
    "sugar_g":     "Sugar load",
    "calcium_mg":  "Calcium",
    "zinc_mg":     "Zinc",
    "sodium_mg":   "Sodium",
}

DEFAULT_THRESHOLDS = {"anemia": 0.40, "diabetes": 0.35, "overweight": 0.50}


class RiskPredictor:
    def __init__(self) -> None:
        _ensure_bundle()
        bundle = joblib.load(BUNDLE_PATH)

        self.models     = bundle["models"]
        self.thresholds = bundle.get("thresholds", DEFAULT_THRESHOLDS)

        # Explainers may not be in the bundle (locally-trained model).
        # Build them at runtime — TreeExplainer works for both XGBoost and GBM.
        if "explainers" in bundle:
            self.explainers = bundle["explainers"]
        else:
            self.explainers = {}
            for disease, model in self.models.items():
                clf = model.named_steps["clf"] if hasattr(model, "named_steps") else model
                self.explainers[disease] = shap.TreeExplainer(clf)

    def predict(
        self,
        logs: list[dict],
        age: float,
        sex: str,           # "male" | "female"
        weight_kg: float = 70.0,
        height_cm: float = 170.0,
    ) -> dict:
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

        # Scale single-meal logs to full-day estimates
        n_meals = max(1, len(logs))
        scale   = max(1.0, 3.0 / n_meals)
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
        for disease, model in self.models.items():
            prob = float(model.predict_proba(X)[0, 1])
            scores[disease] = max(1, round(prob * 100))

            # Get the scaled input for SHAP (Pipeline has scaler; plain clf gets raw X)
            if hasattr(model, "named_steps") and "scaler" in model.named_steps:
                X_shap = model.named_steps["scaler"].transform(X)
            else:
                X_shap = X

            sv = self.explainers[disease].shap_values(X_shap)

            # TreeExplainer returns list[class_0, class_1] for binary clf
            if isinstance(sv, list):
                sv_row = np.array(sv[1]).reshape(-1)
            else:
                sv_row = np.array(sv).reshape(-1)

            top_idx = np.abs(sv_row).argsort()[::-1][:5]
            shap_out[disease] = [
                {"f": FEATURE_LABELS[FEATURES[i]], "v": round(float(sv_row[i]), 3)}
                for i in top_idx
            ]

        # ── Overweight: replace ML output with BMI-based score ────────────────
        # The ML model was trained on dietary proxies from DHS data and almost
        # never fires for typical East African diets. BMI (derived from the
        # user's actual weight/height) is the clinical gold standard for
        # overweight assessment, so we use it directly.
        bmi = weight_kg / (height_cm / 100) ** 2
        if bmi >= 35:
            ow_score = 92
        elif bmi >= 30:
            ow_score = 80
        elif bmi >= 27.5:
            ow_score = 65
        elif bmi >= 25:
            ow_score = 48
        elif bmi >= 23:
            ow_score = 25
        elif bmi >= 18.5:
            ow_score = 8
        else:
            ow_score = 15  # underweight carries its own risk
        scores["overweight"] = ow_score

        # Inject BMI as the top SHAP entry so the explanation reflects the
        # primary driver of this score.
        bmi_shap = round((bmi - 22.5) * 0.04, 3)  # positive above normal range
        shap_out["overweight"] = [{"f": "Body Mass Index", "v": bmi_shap}] + shap_out["overweight"][:4]

        # ── Diabetes: replace weak ML output with glycemic load heuristic ─────
        # The ML model achieved AUROC 0.598 (essentially random) because the
        # training label was a dietary proxy rather than measured glucose.
        # We substitute a glycemic load score based on daily sugar and net carb.
        daily_sugar = totals["sugar_g"]
        net_carb    = max(0.0, totals["carb_g"] - totals["fiber_g"])
        if daily_sugar >= 75:
            diab_score = 70
        elif daily_sugar >= 50:
            diab_score = 55
        elif daily_sugar >= 30:
            diab_score = 38
        elif daily_sugar >= 15:
            diab_score = 22
        elif net_carb >= 350:
            diab_score = 30
        elif net_carb >= 250:
            diab_score = 20
        else:
            diab_score = 8  # baseline population prevalence
        scores["diabetes"] = diab_score

        scores["overall"] = round(sum(scores[d] for d in ["anemia", "diabetes", "overweight"]) / 3)
        return {"scores": scores, "shap": shap_out}
