"""
NutriVision AI — Disease Risk Model Training
=============================================
3 binary XGBoost classifiers: anemia | diabetes | overweight
Dataset:  NHANES 2017-2018 (dietary recall + lab outcomes)
          On Kaggle add dataset: "cdc/national-health-and-nutrition-examination-survey"
          or any pre-merged NHANES CSV (SEQN, age, sex, nutrients, hemoglobin, BMI, HbA1c)

Run on Kaggle GPU (T4 / P100).  Training takes < 5 minutes.
The heavy GPU quota is for the food image classifier, not this script.

Outputs
-------
  nutrisense_model.joblib  — bundle dict:
    bundle['features']         list[str]  – feature names in order
    bundle['models']           dict       – {'anemia': pipeline, 'diabetes': pipeline, 'overweight': pipeline}
    bundle['explainers']       dict       – {'anemia': shap.TreeExplainer, ...}
    bundle['thresholds']       dict       – disease probability cut-offs used at inference
    bundle['label_definitions'] dict      – how each label was derived (for thesis)
"""

# ── 0. Install ───────────────────────────────────────────────────────────────
# !pip install xgboost shap optuna -q

# ── 1. Imports ───────────────────────────────────────────────────────────────
import os
import warnings
import numpy as np
import pandas as pd
import joblib
import shap
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    roc_auc_score, average_precision_score,
    classification_report, confusion_matrix, RocCurveDisplay,
)
from sklearn.utils.class_weight import compute_sample_weight
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")
np.random.seed(42)

# ── 2. Configuration ─────────────────────────────────────────────────────────
BUNDLE_SAVE_PATH = "nutrisense_model.joblib"   # adjust on Kaggle: /kaggle/working/

FEATURES = [
    "age", "sex",                                          # demographic
    "energy_kcal", "protein_g", "fat_g", "carb_g",       # macros
    "iron_mg", "vitC_mg", "vitA_mcg",                     # micronutrients: anemia-relevant
    "fiber_g", "sugar_g",                                  # fiber / sugar: diabetes-relevant
    "calcium_mg", "zinc_mg",                               # bone / immune
    "sodium_mg",                                           # overweight proxy
]

TARGETS = ["anemia", "diabetes", "overweight"]

# ── 3. Data loading ───────────────────────────────────────────────────────────
# NHANES 2017-2018 files (XPT) — merge on SEQN
# On Kaggle: /kaggle/input/nhanes-2017-2018/ or similar
# Column reference:
#   DR1TOT_J.XPT  -> dietary totals (SEQN, DR1TKCAL, DR1TPROT, DR1TTFAT, DR1TCARB,
#                                    DR1TIRON, DR1TVC, DR1TVARA, DR1TFIBE,
#                                    DR1TSUGR, DR1TCALC, DR1TZINC, DR1TSODI)
#   DEMO_J.XPT    -> demographics   (SEQN, RIDAGEYR, RIAGENDR)
#   CBC_J.XPT     -> hemoglobin     (SEQN, LBXHGB)
#   BMX_J.XPT     -> anthropometry  (SEQN, BMXBMI)
#   GHB_J.XPT     -> HbA1c          (SEQN, LBXGH)

def load_nhanes(base_path: str) -> pd.DataFrame:
    """
    Merge NHANES dietary + demographic + lab files.
    Returns one row per participant with all features and outcome columns.
    """
    import pyreadstat  # pip install pyreadstat  (pre-installed on Kaggle)

    def read_xpt(fname):
        df, _ = pyreadstat.read_xpt(os.path.join(base_path, fname))
        return df

    diet  = read_xpt("DR1TOT_J.XPT")[["SEQN","DR1TKCAL","DR1TPROT","DR1TTFAT","DR1TCARB",
                                        "DR1TIRON","DR1TVC","DR1TVARA","DR1TFIBE",
                                        "DR1TSUGR","DR1TCALC","DR1TZINC","DR1TSODI"]]
    demo  = read_xpt("DEMO_J.XPT")[["SEQN","RIDAGEYR","RIAGENDR"]]
    hgb   = read_xpt("CBC_J.XPT")[["SEQN","LBXHGB"]]
    bmi   = read_xpt("BMX_J.XPT")[["SEQN","BMXBMI"]]
    hba1c = read_xpt("GHB_J.XPT")[["SEQN","LBXGH"]]

    df = (demo
          .merge(diet,  on="SEQN", how="inner")
          .merge(hgb,   on="SEQN", how="inner")
          .merge(bmi,   on="SEQN", how="inner")
          .merge(hba1c, on="SEQN", how="inner"))

    df = df.rename(columns={
        "RIDAGEYR": "age",
        "RIAGENDR": "sex",           # 1=male  2=female
        "DR1TKCAL": "energy_kcal",
        "DR1TPROT": "protein_g",
        "DR1TTFAT": "fat_g",
        "DR1TCARB": "carb_g",
        "DR1TIRON": "iron_mg",
        "DR1TVC":   "vitC_mg",
        "DR1TVARA": "vitA_mcg",
        "DR1TFIBE": "fiber_g",
        "DR1TSUGR": "sugar_g",
        "DR1TCALC": "calcium_mg",
        "DR1TZINC": "zinc_mg",
        "DR1TSODI": "sodium_mg",
        "LBXHGB":   "_hemoglobin",
        "BMXBMI":   "_bmi",
        "LBXGH":    "_hba1c",
    })
    return df


def make_labels(df: pd.DataFrame) -> pd.DataFrame:
    """
    Derive binary disease labels from lab measurements.
    WHO / ADA thresholds:
      anemia    : hemoglobin < 12 g/dL (women) | < 13 g/dL (men)
      overweight: BMI >= 25
      diabetes  : HbA1c >= 6.5 %
    """
    df = df.copy()
    df["anemia"]     = ((df["sex"] == 2) & (df["_hemoglobin"] < 12.0) |
                        (df["sex"] == 1) & (df["_hemoglobin"] < 13.0)).astype(int)
    df["overweight"] = (df["_bmi"] >= 25.0).astype(int)
    df["diabetes"]   = (df["_hba1c"] >= 6.5).astype(int)
    return df


# ── Fallback: generate synthetic data when NHANES files are not available ────
def generate_synthetic_nhanes(n: int = 8000) -> pd.DataFrame:
    """
    Physiologically-plausible synthetic dataset.
    Replace with real NHANES data for thesis submission.
    """
    rng = np.random.default_rng(42)
    sex = rng.integers(1, 3, n)
    age = rng.uniform(18, 75, n)

    energy   = rng.normal(2100, 600, n).clip(800, 4500)
    protein  = rng.normal(80,  25,  n).clip(20,  200)
    fat      = rng.normal(80,  25,  n).clip(20,  200)
    carb     = rng.normal(260, 80,  n).clip(50,  600)
    iron     = rng.normal(14,  6,   n).clip(1,   40)
    vitC     = rng.normal(90,  50,  n).clip(0,   400)
    vitA     = rng.normal(700, 300, n).clip(50,  3000)
    fiber    = rng.normal(18,  8,   n).clip(2,   60)
    sugar    = rng.normal(90,  40,  n).clip(5,   300)
    calcium  = rng.normal(900, 300, n).clip(100, 2500)
    zinc     = rng.normal(11,  4,   n).clip(1,   40)
    sodium   = rng.normal(3400, 900,n).clip(500, 8000)

    # Derive noisy lab values correlated with nutrients
    hgb  = np.where(sex == 2, 13.0, 14.5) + iron * 0.08 - age * 0.02 + rng.normal(0, 0.8, n)
    bmi  = 25 + (energy - 2100) / 600 + age * 0.05 - protein * 0.03 + rng.normal(0, 3, n)
    hba1c= 5.0 + (sugar - 90) / 150 + (bmi - 25) * 0.06 + rng.normal(0, 0.5, n)

    df = pd.DataFrame({
        "age": age, "sex": sex,
        "energy_kcal": energy, "protein_g": protein, "fat_g": fat,  "carb_g": carb,
        "iron_mg": iron,   "vitC_mg": vitC,  "vitA_mcg": vitA,
        "fiber_g": fiber,  "sugar_g": sugar, "calcium_mg": calcium,
        "zinc_mg": zinc,   "sodium_mg": sodium,
        "_hemoglobin": hgb, "_bmi": bmi, "_hba1c": hba1c,
    })
    return make_labels(df)


# ── 4. Prepare dataset ────────────────────────────────────────────────────────
NHANES_DIR = "/kaggle/input/nhanes-2017-2018"   # change if your dataset slug differs

if os.path.exists(NHANES_DIR):
    print("Loading real NHANES data …")
    raw = load_nhanes(NHANES_DIR)
    df  = make_labels(raw)
else:
    print("NHANES files not found — using synthetic data (replace for thesis)")
    df = generate_synthetic_nhanes(n=10000)

# Drop rows missing any feature
df = df.dropna(subset=FEATURES + TARGETS)
df = df[df["age"] >= 18]           # adults only

print(f"\nDataset: {len(df):,} participants")
for t in TARGETS:
    pos = df[t].sum()
    print(f"  {t:12s}: {pos:5,} positive ({pos/len(df)*100:.1f} %)")

X = df[FEATURES].astype(float).values
Y = df[TARGETS].values   # shape (n, 3)

# ── 5. XGBoost hyperparameters ────────────────────────────────────────────────
# These are sensible defaults; tune with Optuna if you have time.
XGB_PARAMS = dict(
    n_estimators      = 400,
    max_depth         = 5,
    learning_rate     = 0.05,
    subsample         = 0.8,
    colsample_bytree  = 0.8,
    min_child_weight  = 3,
    gamma             = 0.1,
    reg_alpha         = 0.1,
    reg_lambda        = 1.0,
    eval_metric       = "auc",
    use_label_encoder = False,
    random_state      = 42,
    n_jobs            = -1,
    tree_method       = "gpu_hist",   # GPU acceleration on Kaggle
)

# ── 6. Train + evaluate each classifier ──────────────────────────────────────
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

models    = {}
explainers = {}
cv_scores  = {}

for i, target in enumerate(TARGETS):
    y = Y[:, i]
    print(f"\n{'='*60}")
    print(f"  Training: {target.upper()}  (positive rate: {y.mean()*100:.1f}%)")
    print(f"{'='*60}")

    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf",    XGBClassifier(**XGB_PARAMS)),
    ])

    # 5-fold cross-validation
    sample_weights = compute_sample_weight("balanced", y)
    cv_result = cross_validate(
        pipeline, X, y,
        cv=cv,
        scoring={"auc": "roc_auc", "ap": "average_precision"},
        fit_params={"clf__sample_weight": sample_weights},
        return_train_score=False,
        n_jobs=1,
    )

    auc_mean = cv_result["test_auc"].mean()
    auc_std  = cv_result["test_auc"].std()
    ap_mean  = cv_result["test_ap"].mean()
    print(f"  ROC-AUC : {auc_mean:.3f} ± {auc_std:.3f}")
    print(f"  Avg-Prec: {ap_mean:.3f}")
    cv_scores[target] = {"roc_auc": auc_mean, "avg_precision": ap_mean}

    # Final fit on all data
    pipeline.fit(X, y, clf__sample_weight=sample_weights)
    models[target] = pipeline

    # SHAP (operates on the raw XGB booster, before scaling)
    # Extract the scaler + booster separately for SHAP
    booster = pipeline.named_steps["clf"]
    scaler  = pipeline.named_steps["scaler"]
    X_scaled = scaler.transform(X)

    explainer = shap.TreeExplainer(booster)
    explainers[target] = explainer

    # Quick SHAP summary plot (saved to disk)
    shap_values = explainer.shap_values(X_scaled[:500])   # sample for speed
    plt.figure(figsize=(8, 5))
    shap.summary_plot(
        shap_values, X_scaled[:500],
        feature_names=FEATURES,
        show=False,
        plot_type="bar",
    )
    plt.title(f"SHAP — {target}")
    plt.tight_layout()
    plt.savefig(f"shap_{target}.png", dpi=120, bbox_inches="tight")
    plt.close()
    print(f"  SHAP plot saved → shap_{target}.png")

# ── 7. Confusion matrices (held-out last fold) ───────────────────────────────
fig, axes = plt.subplots(1, 3, figsize=(15, 4))
for ax, target in zip(axes, TARGETS):
    # Use last CV split as a quick held-out check
    train_idx, test_idx = list(cv.split(X, Y[:, TARGETS.index(target)]))[-1]
    y   = Y[:, TARGETS.index(target)]
    pipeline = models[target]
    y_pred = pipeline.predict(X[test_idx])
    cm = confusion_matrix(y[test_idx], y_pred)
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", ax=ax)
    ax.set_title(f"{target}  (ROC-AUC {cv_scores[target]['roc_auc']:.2f})")
    ax.set_xlabel("Predicted"); ax.set_ylabel("Actual")
plt.tight_layout()
plt.savefig("confusion_matrices.png", dpi=120)
print("\nConfusion matrices saved → confusion_matrices.png")

# ── 8. Per-disease top SHAP features for the frontend ────────────────────────
print("\n── Top 5 SHAP features per disease (for frontend display) ──")
shap_top = {}
for target in TARGETS:
    booster = models[target].named_steps["clf"]
    scaler  = models[target].named_steps["scaler"]
    X_scaled = scaler.transform(X[:1000])
    sv = explainers[target].shap_values(X_scaled)
    mean_abs = np.abs(sv).mean(axis=0)
    top_idx  = mean_abs.argsort()[::-1][:5]
    entries  = []
    for idx in top_idx:
        # positive = increases risk, negative = protects
        direction = float(np.mean(sv[:, idx]))
        entries.append({
            "f":     FEATURES[idx],
            "v":     round(direction, 3),
            "label": f"{'Increases' if direction>0 else 'Reduces'} {target} risk",
        })
    shap_top[target] = entries
    print(f"\n  {target}:")
    for e in entries:
        print(f"    {e['f']:15s}  v={e['v']:+.3f}  {e['label']}")

# ── 9. Save the model bundle ──────────────────────────────────────────────────
bundle = {
    "features": FEATURES,
    "models":   models,          # sklearn Pipeline per disease
    "explainers": explainers,    # shap.TreeExplainer per disease
    "shap_top":   shap_top,      # top 5 features per disease (ready for API JSON)
    "thresholds": {              # probability cut-offs (tune per clinical use case)
        "anemia":     0.40,
        "diabetes":   0.35,
        "overweight": 0.50,
    },
    "label_definitions": {
        "anemia":     "Hemoglobin < 12 g/dL (women) or < 13 g/dL (men)  [WHO 2011]",
        "overweight": "BMI >= 25  [WHO]",
        "diabetes":   "HbA1c >= 6.5 %  [ADA 2023]",
    },
    "cv_scores": cv_scores,
    "feature_source": "NHANES 2017-2018 (DR1TOT_J, CBC_J, BMX_J, GHB_J, DEMO_J)",
}

joblib.dump(bundle, BUNDLE_SAVE_PATH)
print(f"\nBundle saved → {BUNDLE_SAVE_PATH}")
print(f"  Models    : {list(bundle['models'].keys())}")
print(f"  CV scores : {cv_scores}")
