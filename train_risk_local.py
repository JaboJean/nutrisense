"""
Train risk model locally on real DHS + STEPS data and push to HuggingFace.
Run: python train_risk_local.py --token hf_YOUR_TOKEN
"""
import argparse
import pandas as pd
import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder

FEATURES = [
    "age", "sex", "energy_kcal", "protein_g", "fat_g", "carb_g",
    "iron_mg", "vitC_mg", "vitA_mcg", "fiber_g", "sugar_g",
    "calcium_mg", "zinc_mg", "sodium_mg",
]
TARGETS = ["anemia", "diabetes", "overweight"]

DHS_PATH   = Path("data/dhs/nutrisense_dhs.csv")
STEPS_PATH = Path("data/STEPS/nutrisense_steps.csv")
OUT_PATH   = Path("api/nutrisense_model.joblib")

def load_data():
    frames = []
    for p in [DHS_PATH, STEPS_PATH]:
        if p.exists():
            df = pd.read_csv(p)
            frames.append(df)
            print(f"  Loaded {p.name}: {len(df):,} rows")
        else:
            print(f"  Not found: {p}")
    assert frames, "No data found"
    df = pd.concat(frames, ignore_index=True)
    df = df.dropna(subset=FEATURES + TARGETS)
    # Encode sex if it's numeric (1=male, 2=female) — keep as-is
    print(f"\nCombined: {len(df):,} rows")
    for t in TARGETS:
        print(f"  {t}: {df[t].mean()*100:.1f}% positive")
    return df

def train(df):
    X = df[FEATURES].values
    models, scores = {}, {}
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    for target in TARGETS:
        y = df[target].values.astype(int)
        clf = GradientBoostingClassifier(
            n_estimators=300, max_depth=4, learning_rate=0.05,
            subsample=0.8, random_state=42,
        )
        auc = cross_val_score(clf, X, y, cv=cv, scoring="roc_auc")
        print(f"  {target}: AUC {auc.mean():.3f} ± {auc.std():.3f}")
        clf.fit(X, y)
        models[target] = clf
        scores[target] = float(auc.mean())
    return models, scores

def save_and_push(models, token):
    bundle = {
        "models":   models,
        "features": FEATURES,
        "targets":  TARGETS,
        "data_source": "DHS Rwanda 2019-20 + WHO STEPS Rwanda 2012",
    }
    joblib.dump(bundle, OUT_PATH)
    print(f"\nSaved -> {OUT_PATH} ({OUT_PATH.stat().st_size/1e6:.1f} MB)")

    if token:
        from huggingface_hub import HfApi
        api = HfApi(token=token)
        api.upload_file(
            path_or_fileobj=str(OUT_PATH),
            path_in_repo="nutrisense_model.joblib",
            repo_id="JeanJabo/nutrisense-api",
            repo_type="space",
        )
        print("Uploaded nutrisense_model.joblib to HuggingFace Space")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--token", default=None, help="HuggingFace write token")
    args = parser.parse_args()

    print("Loading data...")
    df = load_data()
    print("\nTraining models...")
    models, scores = train(df)
    save_and_push(models, args.token)
    print("\nDone.")
