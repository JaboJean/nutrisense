"""
DHS Rwanda 2019-20 -> nutrisense_dhs.csv

Women's IR file (RWIR81FL.DTA) has real hemoglobin/BMI measurements for ~7 300
women. Men's MR file has no biomarkers, so we synthesise men's rows calibrated
to Rwanda male prevalence estimates (WHO 2019 / DHS report).

Output: data/dhs/nutrisense_dhs.csv  -- upload to Kaggle as private dataset.

Run with:
  .venv/Scripts/python.exe data/dhs_to_csv.py
"""

import pathlib
import numpy as np
import pandas as pd

RNG = np.random.default_rng(42)

DHS_DIR   = pathlib.Path(__file__).parent / "dhs" / "RW_2019-20_DHS_07052026_943_252895"
WOMEN_DTA = DHS_DIR / "RWIR81DT" / "RWIR81FL.DTA"
OUT_CSV   = pathlib.Path(__file__).parent / "dhs" / "nutrisense_dhs.csv"

# ── helpers ───────────────────────────────────────────────────────────────────

def gauss(n, mu, sd, lo=None, hi=None):
    v = RNG.normal(mu, sd, n)
    if lo is not None: v = np.clip(v, lo, None)
    if hi is not None: v = np.clip(v, None, hi)
    return v

def synth_features(n, anemia, overweight, sex_male):
    """Synthesise dietary features calibrated to health outcomes."""
    a = anemia.astype(float)
    o = overweight.astype(float)

    kcal   = gauss(n, 0, 280) + np.where(sex_male, 2200, 1850) + o*370 - a*70
    kcal   = np.clip(kcal, 900, 4500)
    prot   = gauss(n, 0, 8)   + np.where(sex_male, 55, 42)     + o*5
    prot   = np.clip(prot, 15, 180)
    fat    = gauss(n, 0, 10)  + np.where(sex_male, 62, 50)     + o*18
    fat    = np.clip(fat, 10, 160)
    carb   = gauss(n, 0, 35)  + np.where(sex_male, 310, 255)   + o*40
    carb   = np.clip(carb, 80, 650)
    iron   = gauss(n, 0, 3)   + np.where(a==1, 8.5, 14.0)      + np.where(sex_male, 2.5, 0)
    iron   = np.clip(iron, 2, 40)
    vitC   = gauss(n, 0, 15)  + np.where(a==1, 22, 48)
    vitC   = np.clip(vitC, 5, 200)
    vitA   = gauss(n, 0, 120) + np.where(a==1, 420, 560)
    vitA   = np.clip(vitA, 80, 1500)
    fiber  = gauss(n, 0, 5)   + np.where(o==1, 12, 16)
    fiber  = np.clip(fiber, 3, 50)
    sugar  = gauss(n, 0, 15)  + np.where(o==1, 52, 32)
    sugar  = np.clip(sugar, 5, 180)
    calc   = gauss(n, 0, 90)  + 420
    calc   = np.clip(calc, 100, 1200)
    zinc   = gauss(n, 0, 2)   + np.where(sex_male, 9.5, 7.5)
    zinc   = np.clip(zinc, 2, 25)
    sodium = gauss(n, 0, 400) + 1600 + o*250
    sodium = np.clip(sodium, 400, 5000)

    # diabetes proxy (Rwanda prevalence ~3.7 %)
    age    = RNG.integers(15, 65, n).astype(float)
    logit  = -4.2 + o*1.1 + (age-30)*0.025 + (sugar-40)*0.008 + (kcal-2000)*0.0004
    diab   = RNG.binomial(1, 1/(1+np.exp(-logit)))

    return pd.DataFrame({
        "energy_kcal": np.round(kcal, 1),
        "protein_g":   np.round(prot, 1),
        "fat_g":        np.round(fat, 1),
        "carb_g":       np.round(carb, 1),
        "iron_mg":      np.round(iron, 2),
        "vitC_mg":      np.round(vitC, 1),
        "vitA_mcg":     np.round(vitA, 0),
        "fiber_g":      np.round(fiber, 1),
        "sugar_g":      np.round(sugar, 1),
        "calcium_mg":   np.round(calc, 0),
        "zinc_mg":      np.round(zinc, 2),
        "sodium_mg":    np.round(sodium, 0),
        "diabetes":     diab,
    })

# ── 1. Women from DHS ─────────────────────────────────────────────────────────

print("Loading women's IR file (this takes ~30 s) …")
raw = pd.read_stata(WOMEN_DTA, columns=["v012", "v445", "v457"],
                    convert_categoricals=False)

raw["bmi"] = raw["v445"] / 100.0
raw.loc[raw["bmi"] > 60, "bmi"] = np.nan   # implausible codes

# v457: 1=severe, 2=moderate, 3=mild anemia; 4=not anemic; 9=missing
raw["anemia"]     = raw["v457"].map({1: 1, 2: 1, 3: 1, 4: 0})
raw["overweight"] = (raw["bmi"] >= 25.0).astype(float)
raw.loc[raw["bmi"].isna(), "overweight"] = np.nan

women = raw.dropna(subset=["anemia", "overweight"]).copy()
women = women[(raw["v012"] >= 15) & (raw["v012"] <= 65)]
women["anemia"]     = women["anemia"].astype(int)
women["overweight"] = women["overweight"].astype(int)
women["age"]        = women["v012"].astype(int)
women["sex"]        = 2  # female

n_w = len(women)
print(f"  Women with valid biomarkers: {n_w:,}")
print(f"  Anemia    {women['anemia'].mean():.1%}   Overweight {women['overweight'].mean():.1%}")

feats_w = synth_features(n_w, women["anemia"].values, women["overweight"].values,
                         sex_male=np.zeros(n_w, bool))

women_out = pd.concat([
    women[["age", "sex", "anemia", "overweight"]].reset_index(drop=True),
    feats_w,
], axis=1)

# ── 2. Men — synthesised, calibrated to Rwanda male estimates ─────────────────
# Rwanda DHS 2019-20 report estimates:
#   Male anemia prevalence  ~  7 %  (lower than women)
#   Male overweight prevalence ~ 13 %

n_m = n_w  # match size
age_m  = RNG.integers(15, 65, n_m)
# sample anemia / overweight with Rwanda male rates
a_m = RNG.binomial(1, 0.07,  n_m)
o_m = RNG.binomial(1, 0.13,  n_m)

feats_m = synth_features(n_m, a_m, o_m, sex_male=np.ones(n_m, bool))

men_out = pd.DataFrame({
    "age":        age_m,
    "sex":        np.ones(n_m, int),
    "anemia":     a_m,
    "overweight": o_m,
})
men_out = pd.concat([men_out, feats_m], axis=1)

# ── 3. Combine & save ─────────────────────────────────────────────────────────

out = pd.concat([women_out, men_out], ignore_index=True)
# reorder columns to match model feature list
col_order = ["age","sex","energy_kcal","protein_g","fat_g","carb_g",
             "iron_mg","vitC_mg","vitA_mcg","fiber_g","sugar_g",
             "calcium_mg","zinc_mg","sodium_mg","anemia","diabetes","overweight"]
out = out[col_order]

OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
out.to_csv(OUT_CSV, index=False)

print(f"\nDataset saved: {OUT_CSV}")
print(f"  Total rows : {len(out):,}  ({n_w:,} DHS women + {n_m:,} calibrated men)")
print(f"  Anemia     : {out['anemia'].mean():.1%}")
print(f"  Diabetes   : {out['diabetes'].mean():.1%}")
print(f"  Overweight : {out['overweight'].mean():.1%}")
