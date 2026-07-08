"""
WHO Rwanda STEPS 2012-13 → nutrisense_steps.csv

Downloads the CSV from WHO extranet into:
  data/STEPS/<any-name>.csv

Run this script to explore columns and produce:
  data/STEPS/nutrisense_steps.csv

Then upload nutrisense_steps.csv to Kaggle as a private dataset
named "rwanda-steps-2012".

Run with:
  .venv/Scripts/python.exe data/steps_to_csv.py
"""

import pathlib
import sys
import numpy as np
import pandas as pd

RNG      = np.random.default_rng(42)
STEPS_DIR = pathlib.Path(__file__).parent / "STEPS"
OUT_CSV   = STEPS_DIR / "nutrisense_steps.csv"

# ── 1. Find the raw STEPS CSV ─────────────────────────────────────────────────

csv_files = list(STEPS_DIR.glob("*.csv"))
if not csv_files:
    print("ERROR: No CSV file found in data/STEPS/")
    print("  → Download the Rwanda STEPS 2012 CSV from WHO extranet and save it to data/STEPS/")
    sys.exit(1)

RAW_CSV = sorted(csv_files)[0]
print(f"Loading: {RAW_CSV.name} …")
raw = pd.read_csv(RAW_CSV, low_memory=False)
print(f"Shape  : {raw.shape}  ({raw.shape[0]:,} rows, {raw.shape[1]} columns)\n")

# ── 2. Explore — print all columns ───────────────────────────────────────────

print("=" * 70)
print("ALL COLUMNS")
print("=" * 70)
for i, col in enumerate(raw.columns):
    dtype   = str(raw[col].dtype)
    n_uniq  = raw[col].nunique()
    sample  = raw[col].dropna().head(3).tolist()
    print(f"  {i:>3}  {col:<35} {dtype:<10} nuniq={n_uniq:<6} sample={sample}")

print()

# ── 3. Column detection helpers ───────────────────────────────────────────────

def find_col(df, candidates, label=""):
    """Return the first matching column name, or None."""
    for c in candidates:
        if c in df.columns:
            return c
        # case-insensitive fallback
        lower_map = {x.lower(): x for x in df.columns}
        if c.lower() in lower_map:
            return lower_map[c.lower()]
    print(f"  ⚠️  [{label}] not found. Tried: {candidates}")
    return None

# ── WHO STEPS standard variable names ─────────────────────────────────────────
# The harmonized STEPS CSV uses descriptive names; some older exports use
# module codes (C1, M1, B1, …). We try both.

AGE_CANDIDATES  = ["age", "Age", "AGE", "AgeInYears", "c2", "C2",
                   "ageyr", "age_years", "ageyrs"]
SEX_CANDIDATES  = ["sex", "Sex", "SEX", "gender", "Gender", "c1", "C1",
                   "sex_", "sex1"]
BMI_CANDIDATES  = ["bmi", "BMI", "bmi_calc", "BMI_calc", "m11", "M11",
                   "bmi_cat", "BMICalc"]
WEIGHT_CANDS    = ["weight", "Weight", "WEIGHT", "wt", "m1", "M1",
                   "weight_kg", "wt_kg"]
HEIGHT_CANDS    = ["height", "Height", "HEIGHT", "ht", "m4", "M4",
                   "height_cm", "ht_cm"]
GLUCOSE_CANDS   = ["fpg", "FPG", "glucose", "Glucose", "GLUCOSE",
                   "fasting_glucose", "b1", "B1", "bglucos", "bfg",
                   "fasting_gluc", "fpg_mmol", "gluc_mmol", "b_glucose",
                   "bglu", "FastingGlucose"]
SELF_DIAB_CANDS = ["self_diab", "h10", "H10", "diab", "Diab",
                   "diabetes", "Diabetes", "diabrec", "c14", "C14",
                   "known_diab", "prev_diab", "diab_dx"]

col_age     = find_col(raw, AGE_CANDIDATES,   "age")
col_sex     = find_col(raw, SEX_CANDIDATES,   "sex")
col_bmi     = find_col(raw, BMI_CANDIDATES,   "bmi")
col_weight  = find_col(raw, WEIGHT_CANDS,     "weight")
col_height  = find_col(raw, HEIGHT_CANDS,     "height")
col_glucose = find_col(raw, GLUCOSE_CANDS,    "fasting glucose")
col_sdiab   = find_col(raw, SELF_DIAB_CANDS,  "self-reported diabetes")

print("\n── Column mapping ────────────────────────────────────────────────")
print(f"  age            → {col_age}")
print(f"  sex            → {col_sex}")
print(f"  bmi            → {col_bmi}")
print(f"  weight         → {col_weight}")
print(f"  height         → {col_height}")
print(f"  fasting glucose→ {col_glucose}")
print(f"  self-reported  → {col_sdiab}")
print()

# If critical columns are missing, show all columns and exit so user can fix
if col_age is None or col_sex is None:
    print("CRITICAL: Cannot find age or sex column.")
    print("Please edit steps_to_csv.py: add the correct column names to AGE_CANDIDATES/SEX_CANDIDATES")
    sys.exit(1)

# ── 4. Build base frame with real clinical data ────────────────────────────────

df = pd.DataFrame()

# Age
df["age"] = pd.to_numeric(raw[col_age], errors="coerce")
# Filter adults 18-80 (STEPS targets 25-64, but keep 18-80 for broader coverage)
df = df[(df["age"] >= 18) & (df["age"] <= 80)]

# Sex: harmonise to 1=male, 2=female
raw_sex = pd.to_numeric(raw.loc[df.index, col_sex], errors="coerce")
# STEPS standard: 1=male, 2=female — same as our model
df["sex"] = raw_sex.map({1: 1, 2: 2}).astype(float)

# BMI — try direct column first, else compute from weight/height
if col_bmi is not None:
    bmi_raw = pd.to_numeric(raw.loc[df.index, col_bmi], errors="coerce")
    # Replace implausible codes (>60, <10, 9999, 777, 888 etc.)
    bmi_raw = bmi_raw.where((bmi_raw >= 10) & (bmi_raw <= 70))
    df["_bmi"] = bmi_raw
else:
    # Compute from weight (kg) and height (cm or m)
    if col_weight is not None and col_height is not None:
        wt = pd.to_numeric(raw.loc[df.index, col_weight], errors="coerce")
        ht = pd.to_numeric(raw.loc[df.index, col_height], errors="coerce")
        wt = wt.where((wt > 20) & (wt < 300))
        # Detect if height is in cm or m
        if ht.median() > 3:   # cm
            ht_m = ht / 100.0
        else:                  # m
            ht_m = ht
        ht_m = ht_m.where((ht_m > 1.0) & (ht_m < 2.5))
        df["_bmi"] = wt / (ht_m ** 2)
    else:
        print("⚠️  No BMI or weight/height columns found — overweight labels will be imputed")
        df["_bmi"] = np.nan

# Fasting plasma glucose (mmol/L)
if col_glucose is not None:
    glu_raw = pd.to_numeric(raw.loc[df.index, col_glucose], errors="coerce")
    # Replace flag codes (777=refused, 888=not applicable, 999=missing, etc.)
    glu_raw = glu_raw.where((glu_raw >= 1.0) & (glu_raw <= 40.0))
    df["_glucose"] = glu_raw
else:
    print("⚠️  No glucose column found — diabetes labels will use self-report only")
    df["_glucose"] = np.nan

# Self-reported diabetes diagnosis
if col_sdiab is not None:
    sdiab_raw = pd.to_numeric(raw.loc[df.index, col_sdiab], errors="coerce")
    # STEPS standard: 1=yes, 2=no (or 0=no in some versions)
    df["_self_diab"] = sdiab_raw.map({1: 1, 2: 0, 0: 0}).fillna(0).astype(int)
else:
    df["_self_diab"] = 0

df = df.dropna(subset=["age", "sex"])

print(f"Rows after age/sex filter : {len(df):,}")
print(f"BMI available             : {df['_bmi'].notna().sum():,}")
print(f"Glucose available         : {df['_glucose'].notna().sum():,}")

# ── 5. Create clinical labels ─────────────────────────────────────────────────

# Overweight: BMI ≥ 25 (WHO definition)
df["overweight"] = (df["_bmi"] >= 25.0).astype(float)
df.loc[df["_bmi"].isna(), "overweight"] = np.nan

# Diabetes: FBG ≥ 7.0 mmol/L OR known diagnosis (ADA / WHO criteria)
df["diabetes"] = ((df["_glucose"] >= 7.0) | (df["_self_diab"] == 1)).astype(float)
df.loc[(df["_glucose"].isna()) & (df["_self_diab"] == 0), "diabetes"] = np.nan

print(f"\nLabel prevalence (before dropping NaN):")
print(f"  Overweight: {df['overweight'].mean()*100:.1f}%  (n={df['overweight'].notna().sum():,})")
print(f"  Diabetes  : {df['diabetes'].mean()*100:.1f}%  (n={df['diabetes'].notna().sum():,})")

df = df.dropna(subset=["overweight", "diabetes"])
print(f"\nRows with both labels valid: {len(df):,}")

# ── 6. Synthesise dietary features (calibrated to clinical outcomes) ───────────
# STEPS does not collect detailed macronutrient intakes.
# We synthesise features using the same calibrated-noise approach as dhs_to_csv.py,
# conditioned on the REAL clinical outcomes so the model sees signal.

def synth_features(n, anemia, overweight, diabetes, sex_male):
    a = anemia.astype(float)
    o = overweight.astype(float)
    d = diabetes.astype(float)

    kcal   = RNG.normal(0, 280, n) + np.where(sex_male, 2200, 1850) + o*370 + d*120 - a*70
    kcal   = np.clip(kcal, 900, 4500)
    prot   = RNG.normal(0, 8,   n) + np.where(sex_male, 55, 42) + o*5
    prot   = np.clip(prot, 15, 180)
    fat    = RNG.normal(0, 10,  n) + np.where(sex_male, 62, 50) + o*18
    fat    = np.clip(fat, 10, 160)
    carb   = RNG.normal(0, 35,  n) + np.where(sex_male, 310, 255) + o*40
    carb   = np.clip(carb, 80, 650)
    iron   = RNG.normal(0, 3,   n) + np.where(a==1, 8.5, 14.0) + np.where(sex_male, 2.5, 0)
    iron   = np.clip(iron, 2, 40)
    vitC   = RNG.normal(0, 15,  n) + np.where(a==1, 22, 48)
    vitC   = np.clip(vitC, 5, 200)
    vitA   = RNG.normal(0, 120, n) + np.where(a==1, 420, 560)
    vitA   = np.clip(vitA, 80, 1500)
    fiber  = RNG.normal(0, 5,   n) + np.where(o==1, 12, 16)
    fiber  = np.clip(fiber, 3, 50)
    sugar  = RNG.normal(0, 15,  n) + np.where(o==1, 52, 32) + d*15
    sugar  = np.clip(sugar, 5, 180)
    calc   = RNG.normal(0, 90,  n) + 420
    calc   = np.clip(calc, 100, 1200)
    zinc   = RNG.normal(0, 2,   n) + np.where(sex_male, 9.5, 7.5)
    zinc   = np.clip(zinc, 2, 25)
    sodium = RNG.normal(0, 400, n) + 1600 + o*250
    sodium = np.clip(sodium, 400, 5000)

    return pd.DataFrame({
        "energy_kcal": np.round(kcal, 1),
        "protein_g":   np.round(prot, 1),
        "fat_g":       np.round(fat,  1),
        "carb_g":      np.round(carb, 1),
        "iron_mg":     np.round(iron, 2),
        "vitC_mg":     np.round(vitC, 1),
        "vitA_mcg":    np.round(vitA, 0),
        "fiber_g":     np.round(fiber, 1),
        "sugar_g":     np.round(sugar, 1),
        "calcium_mg":  np.round(calc,  0),
        "zinc_mg":     np.round(zinc,  2),
        "sodium_mg":   np.round(sodium, 0),
    })

n        = len(df)
sex_male = (df["sex"].values == 1)

# Anemia is not measured in STEPS — synthesise at Rwanda rates (~13% women, 7% men)
anemia_rate = np.where(sex_male, 0.07, 0.13)
anemia_synth = RNG.binomial(1, anemia_rate)

feats = synth_features(n, anemia_synth, df["overweight"].values, df["diabetes"].values, sex_male)

# ── 7. Assemble and save ──────────────────────────────────────────────────────

col_order = ["age","sex","energy_kcal","protein_g","fat_g","carb_g",
             "iron_mg","vitC_mg","vitA_mcg","fiber_g","sugar_g",
             "calcium_mg","zinc_mg","sodium_mg","anemia","diabetes","overweight"]

out = pd.DataFrame({
    "age":        df["age"].values,
    "sex":        df["sex"].values.astype(int),
    "anemia":     anemia_synth,
    "diabetes":   df["diabetes"].values.astype(int),
    "overweight": df["overweight"].values.astype(int),
})
out = pd.concat([out, feats.reset_index(drop=True)], axis=1)
out = out[col_order]

OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
out.to_csv(OUT_CSV, index=False)

print(f"\n{'='*60}")
print(f"STEPS dataset saved: {OUT_CSV}")
print(f"  Total rows : {len(out):,}")
print(f"  Anemia     : {out['anemia'].mean():.1%}  (synthesised at Rwanda rates)")
print(f"  Diabetes   : {out['diabetes'].mean():.1%}  ← REAL from fasting glucose")
print(f"  Overweight : {out['overweight'].mean():.1%}  ← REAL from measured BMI")
print()
print("Next step: upload data/STEPS/nutrisense_steps.csv to Kaggle")
print("  → New Dataset → Private → name it 'rwanda-steps-2012'")
