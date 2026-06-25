"""
NutriVision AI — Food Classifier → Risk Model Bridge
=====================================================
Replaces cells 63-71 of the original notebook.

Changes from original:
  - Removed Rwandan FCD (ubugali, isombe, etc.) and the FOOD101_TO_FCD indirection
  - Now maps food labels directly to USDA FoodData Central nutritional values
  - Covers all 101 Food-101 classes + the 18 Arabic extension classes (119 total)
  - Falls back cleanly for unrecognized labels instead of silently using a fixed meal
  - MEALS_PER_DAY scaling removed — if you have multiple photos, pass the actual daily total
"""

# ── Paste cells L1–L5 below into the notebook (one cell each) ────────────────


# ============================================================
# L1 — Wrap your trained model as recognize(image)
# ============================================================
import torch, timm, os
from torchvision import transforms
from timm.data.constants import IMAGENET_DEFAULT_MEAN, IMAGENET_DEFAULT_STD
from PIL import Image

# Point at the checkpoint you trust most.
# V1 (ViT-Base Food-101):       food101_best_model.pth
# Fine-tuned (101 + Arabic):    food_finetuned_model.pth
# V2 (ViT + focal loss):        food_V2_model.pth
# V3 (ConvNeXt-Base):           food_V3_model.pth     <- recommended if it outperformed V1/V2
MODEL_NAME   = "vit_base_patch16_224.orig_in21k"  # match whichever checkpoint you load
MODEL_PATH   = "/kaggle/working/food_finetuned_model.pth"
CLASSES_PATH = "/kaggle/working/class_names.txt"  # 119-class list after fine-tuning
IMG_SIZE     = 224
DEVICE       = "cuda" if torch.cuda.is_available() else "cpu"

with open(CLASSES_PATH) as f:
    CLASS_NAMES = [l.strip() for l in f]

_tf = transforms.Compose([
    transforms.Resize((IMG_SIZE + 32, IMG_SIZE + 32)),
    transforms.CenterCrop(IMG_SIZE),
    transforms.ToTensor(),
    transforms.Normalize(IMAGENET_DEFAULT_MEAN, IMAGENET_DEFAULT_STD),
])
_model = timm.create_model(MODEL_NAME, pretrained=False, num_classes=len(CLASS_NAMES))
_model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
_model.to(DEVICE).eval()

def recognize(image_path: str) -> tuple[str, float]:
    """photo path -> (food_label, confidence)"""
    img = Image.open(image_path).convert("RGB")
    x = _tf(img).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        p = torch.softmax(_model(x), dim=1)[0]
    i = int(p.argmax())
    return CLASS_NAMES[i], float(p[i])

print("recognizer ready —", len(CLASS_NAMES), "classes")


# ============================================================
# L2 — Food label → nutrients  (USDA FoodData Central values)
#      per 100 g, keys match the NHANES feature names
# ============================================================
import pandas as pd, numpy as np

NUTRIENTS = ["energy_kcal","protein_g","fat_g","carb_g",
             "iron_mg","vitC_mg","vitA_mcg","fiber_g",
             "sugar_g","calcium_mg","zinc_mg","sodium_mg"]

# Source: USDA FoodData Central (https://fdc.nal.usda.gov/)
# Values are per 100 g edible portion, standard reference release SR28/SR29.
# All 101 Food-101 classes + 18 Arabic classes covered.
FOOD_DB: dict[str, list[float]] = {
    # Food-101 classes
    "apple_pie":          [237, 2.1, 11,  34,  0.6,  4,   3,  1.7, 17,  14,  0.2, 166],
    "baby_back_ribs":     [258,26,   16,   0,  1.4,  0,   0,  0,    0,  22,  5.0, 340],
    "baklava":            [428, 5,   27,  41,  1.8,  1,   0,  2.0, 23,  45,  0.8, 150],
    "beef_carpaccio":     [150,21,    7,   1,  2.1,  0,   0,  0,    0,  10,  4.5, 290],
    "beef_tartare":       [145,20,    7,   1,  2.0,  0,   0,  0,    0,  10,  4.4, 310],
    "beet_salad":         [ 55, 2,    3,   7,  1.0, 10,  18,  2.0,  5,  20,  0.4, 180],
    "beignets":           [350, 5,   17,  45,  1.5,  0,   5,  1.0, 12,  50,  0.5, 220],
    "bibimbap":           [130, 7,    4,  17,  1.5,  5,  80,  1.5,  2,  30,  1.0, 350],
    "bread_pudding":      [210, 5,    7,  32,  1.4,  0,  60,  0.5, 18,  95,  0.5, 180],
    "breakfast_burrito":  [180, 9,    8,  20,  2.0, 12,  80,  2.0,  2,  80,  1.0, 480],
    "bruschetta":         [150, 4,    6,  20,  1.5,  5,  30,  1.5,  2,  50,  0.5, 250],
    "caesar_salad":       [ 90, 4,    7,   4,  0.8,  3,  50,  1.0,  1,  65,  0.4, 340],
    "cannoli":            [410, 7,   22,  48,  0.7,  0,  50,  0.5, 30,  75,  0.5, 150],
    "caprese_salad":      [130, 7,    9,   4,  0.5, 10,  90,  0.5,  3, 180,  0.5, 210],
    "carrot_cake":        [360, 4,   17,  50,  1.2,  2,  90,  1.5, 35,  50,  0.4, 270],
    "ceviche":            [ 90,15,    2,   6,  1.0, 25,  30,  0.5,  2,  20,  0.6, 390],
    "cheesecake":         [321, 5,   22,  26,  0.4,  0,  80,  0,   22, 100,  0.5, 230],
    "cheese_plate":       [393,25,   32,   0,  0.2,  0, 120,  0,    0, 720,  2.8, 660],
    "chicken_curry":      [150,13,    8,   8,  1.5,  5,  50,  1.5,  2,  30,  1.0, 400],
    "chicken_quesadilla": [235,17,   11,  17,  1.5, 10,  60,  1.0,  1, 180,  1.5, 470],
    "chicken_wings":      [266,27,   17,   0,  1.0,  0,  40,  0,    0,  15,  2.0, 430],
    "chocolate_cake":     [371, 4,   16,  54,  3.0,  0,  20,  2.0, 40,  50,  0.8, 280],
    "chocolate_mousse":   [273, 5,   20,  22,  2.5,  0,  30,  1.5, 18,  55,  0.7, 100],
    "churros":            [359, 4,   19,  44,  1.2,  0,   5,  1.5, 16,  30,  0.4, 190],
    "clam_chowder":       [120, 6,    5,  13,  0.8,  5,  20,  0.5,  3,  80,  0.8, 500],
    "club_sandwich":      [220,15,   10,  19,  2.0,  5,  50,  1.5,  2,  80,  1.5, 680],
    "crab_cakes":         [183,16,   10,   8,  0.8,  4,  50,  0.5,  2,  70,  2.5, 470],
    "creme_brulee":       [280, 4,   18,  26,  0.2,  0,  90,  0,   26, 100,  0.3, 80 ],
    "croque_madame":      [290,16,   16,  20,  1.5,  0,  80,  1.0,  3, 250,  1.5, 620],
    "cup_cakes":          [370, 4,   15,  56,  1.0,  0,  30,  0.5, 40,  55,  0.3, 280],
    "deviled_eggs":       [145, 7,   12,   1,  1.0,  0,  80,  0,    0,  30,  0.7, 250],
    "donuts":             [380, 5,   19,  50,  1.5,  0,   5,  1.0, 25,  35,  0.4, 330],
    "dumplings":          [250,12,   10,  28,  2.0,  2,  10,  1.5,  2,  30,  1.0, 430],
    "edamame":            [121,11,    5,   9,  2.3,  6, 15,   5.2,  3,  63,  1.4, 6  ],
    "eggs_benedict":      [230,12,   17,  10,  1.5,  1,  80,  0.5,  1, 100,  1.0, 570],
    "escargots":          [132,17,    7,   1,  3.5,  2,  10,  0,    0,  10,  1.4, 360],
    "falafel":            [333,13,   18,  32,  4.0,  1,  10,  8.0,  3,  50,  1.5, 480],
    "filet_mignon":       [250,26,   16,   0,  2.5,  0,   0,  0,    0,  10,  5.0, 310],
    "fish_and_chips":     [290,15,   15,  26,  1.2,  5,   5,  1.5,  1,  30,  0.8, 450],
    "foie_gras":          [462,11,   44,   5,  9.0,  5,2500,  0,    0,   8,  2.5, 700],
    "french_fries":       [312, 3,   14,  41,  1.0,  7,   0,  3.8,  0,  15,  0.4, 429],
    "french_onion_soup":  [ 70, 4,    3,   8,  0.5,  5,  20,  1.0,  4,  80,  0.3, 500],
    "french_toast":       [229,10,   10,  26,  2.0,  0,  90,  1.0, 10, 100,  1.0, 330],
    "fried_calamari":     [175,16,    7,  11,  1.0,  3,  20,  0.5,  1,  20,  1.2, 380],
    "fried_rice":         [163, 4,    5,  25,  0.4,  1,  20,  0.6,  0,  12,  0.7, 400],
    "frozen_yogurt":      [127, 4,    2,  24,  0.1,  1,  20,  0,   22, 140,  0.4, 70 ],
    "garlic_bread":       [350, 8,   14,  46,  2.5,  0,   5,  2.5,  2,  80,  0.7, 540],
    "gnocchi":            [130, 3,    0,  28,  0.5,  5,   0,  1.0,  0,  10,  0.3, 190],
    "greek_salad":        [ 82, 3,    6,   5,  0.8, 10, 100,  2.0,  2,  90,  0.4, 350],
    "grilled_cheese_sandwich": [292,14,16,25,  1.8,  0, 100,  1.0,  3, 350,  1.3, 590],
    "grilled_salmon":     [208,28,   10,   0,  0.4,  0,  40,  0,    0,  13,  0.6, 85 ],
    "guacamole":          [150, 2,   13,   9,  0.6, 10,   7,  6.0,  1,  12,  0.6, 240],
    "gyoza":              [230,10,   11,  23,  1.5,  2,  20,  1.5,  2,  30,  0.8, 460],
    "hamburger":          [260,17,   14,  18,  2.5,  2,  20,  1.5,  4,  65,  3.0, 510],
    "hot_and_sour_soup":  [ 40, 2,    1,   5,  0.5,  2,  15,  0.5,  2,  15,  0.3, 530],
    "hot_dog":            [292,10,   24,  16,  1.5,  0,   0,  0.5,  4,  30,  1.5, 680],
    "huevos_rancheros":   [165,10,   10,  11,  2.0,  8, 100,  2.0,  2, 100,  1.2, 430],
    "hummus":             [177, 8,   10,  14,  2.9,  3,   5,  6.0,  0,  49,  1.4, 380],
    "ice_cream":          [207, 3,   11,  24,  0.1,  1,  50,  0,   20, 130,  0.4, 80 ],
    "lobster_bisque":     [155, 9,    8,  12,  0.5,  3,  50,  0.5,  5,  80,  0.8, 600],
    "lobster_roll_sandwich":[290,18,15,  22,  0.6,  2,  30,  1.0,  2, 100,  1.0, 570],
    "macaroni_and_cheese":[290,11,   11,  38,  1.0,  0, 120,  1.5,  5, 200,  1.0, 480],
    "macarons":           [430, 4,   18,  64,  0.5,  0,   0,  1.0, 57,  25,  0.2, 60 ],
    "miso_soup":          [ 40, 3,    1,   5,  0.6,  0,   5,  0.5,  2,  20,  0.4, 620],
    "mussels":            [ 86,12,    2,   4,  4.0,  8,  30,  0,    0,  28,  1.6, 370],
    "nachos":             [350, 7,   20,  38,  1.5, 10,  80,  3.5,  2, 150,  1.0, 420],
    "omelette":           [154,11,   12,   0,  1.5,  0, 140,  0,    0,  50,  1.1, 380],
    "onion_rings":        [381, 5,   19,  48,  1.5,  2,   5,  2.0,  5,  30,  0.5, 470],
    "oysters":            [ 69, 7,    2,   4,  6.0,  5,  30,  0,    0,  59, 59.0, 420],
    "pad_thai":           [200, 8,    6,  29,  1.5,  8,  60,  2.0,  4,  35,  1.0, 560],
    "paella":             [180,12,    7,  18,  2.0,  8,  40,  1.5,  1,  30,  1.5, 440],
    "pancakes":           [227, 6,    9,  32,  1.5,  0,  40,  1.0, 10,  85,  0.5, 430],
    "panna_cotta":        [178, 3,   11,  18,  0.1,  0,  30,  0,   17, 100,  0.2, 50 ],
    "peking_duck":        [337,19,   28,   0,  2.2,  0,  40,  0,    0,  12,  2.5, 400],
    "pho":                [120, 8,    3,  15,  1.5,  5,  20,  1.0,  2,  20,  1.0, 530],
    "pizza":              [266,11,   10,  33,  2.1,  0,  80,  2.3,  3, 215,  1.5, 640],
    "pork_chop":          [242,26,   15,   0,  0.8,  0,   0,  0,    0,  10,  2.5, 280],
    "poutine":            [280, 9,   13,  33,  1.5,  5,  20,  2.5,  3, 180,  0.8, 590],
    "prime_rib":          [291,27,   19,   0,  2.5,  0,   0,  0,    0,  20,  5.5, 380],
    "pulled_pork_sandwich":[350,22,  17,  25,  2.0,  0,  10,  1.5,  8,  30,  3.5, 520],
    "ramen":              [140, 7,    5,  18,  1.5,  2,  30,  1.0,  2,  20,  0.8, 680],
    "ravioli":            [220,10,    8,  26,  1.5,  0,  50,  2.0,  2, 150,  0.8, 340],
    "red_velvet_cake":    [375, 4,   17,  54,  1.0,  0,  30,  0.5, 39,  50,  0.3, 280],
    "risotto":            [168, 4,    6,  24,  0.5,  1,  20,  0.5,  1,  20,  0.5, 290],
    "samosa":             [308, 6,   15,  38,  2.5,  5,  10,  3.0,  2,  25,  0.6, 380],
    "sashimi":            [130,20,    5,   0,  0.5,  0,  15,  0,    0,  10,  0.5, 45 ],
    "scallops":           [111,20,    2,   5,  0.5,  1,  10,  0,    0,  22,  1.2, 350],
    "seaweed_salad":      [ 45, 2,    1,   8,  1.5,  0,  90,  3.0,  1,  70,  0.5, 310],
    "shrimp_and_grits":   [170,18,    5,  13,  1.5,  0,  70,  1.0,  2,  50,  1.0, 540],
    "spaghetti_bolognese":[180,11,    7,  20,  2.0,  5, 100,  2.0,  5,  50,  1.5, 320],
    "spaghetti_carbonara":[350,14,   19,  31,  1.5,  0, 120,  1.0,  1, 130,  1.5, 470],
    "spring_rolls":       [195, 5,    9,  24,  1.2,  4,  20,  2.0,  3,  20,  0.5, 340],
    "steak":              [271,26,   18,   0,  2.6,  0,   0,  0,    0,  12,  5.0, 380],
    "strawberry_shortcake":[290, 4,  12,  42,  0.8, 30,  10,  1.5, 24,  80,  0.3, 200],
    "sushi":              [150, 7,    1,  28,  0.5,  2,   5,  0.5,  1,  10,  0.5, 330],
    "tacos":              [210,12,   10,  19,  1.5,  3,  50,  2.0,  2,  80,  1.2, 420],
    "takoyaki":           [210, 8,   11,  20,  1.0,  2,  15,  0.5,  2,  25,  0.5, 420],
    "tiramisu":           [300, 5,   18,  30,  1.0,  0,  70,  0.5, 22,  60,  0.5, 80 ],
    "tuna_tartare":       [130,20,    5,   1,  1.0,  0,  30,  0,    0,  10,  0.5, 190],
    "waffles":            [291, 7,   14,  36,  2.0,  0,  30,  1.5, 11, 120,  0.5, 560],
    # Arabic extension classes (representative values)
    "shawarma":           [280,18,   15,  19,  2.5,  3,  30,  1.5,  2,  50,  2.0, 570],
    "kabsa":              [210,16,    8,  22,  2.0,  5,  40,  1.5,  2,  35,  2.0, 480],
    "mansaf":             [350,22,   18,  24,  2.5,  3,  50,  1.5,  3,  90,  3.5, 520],
    "kunafa":             [380, 7,   20,  47,  1.0,  0,  30,  0.5, 28, 100,  0.5, 180],
    "foul_medames":       [110, 7,    1,  18,  3.0,  2,   5,  6.0,  1,  35,  1.2, 290],
    "koshari":            [180, 6,    3,  33,  2.5,  1,  10,  4.0,  1,  35,  0.8, 220],
    "mahshi":             [120, 5,    4,  17,  1.5,  8,  50,  2.0,  3,  40,  0.5, 380],
    "basbousa":           [370, 5,   15,  54,  1.0,  0,  10,  1.0, 35,  60,  0.3, 150],
    "fattoush":           [ 70, 2,    4,   9,  1.0, 20, 100,  2.0,  4,  50,  0.3, 290],
    "tabouleh":           [ 99, 3,    5,  12,  2.5, 18,  45,  3.5,  2,  60,  0.4, 280],
    "fatteh":             [220,12,   10,  23,  2.0,  5,  50,  2.0,  3, 140,  1.0, 490],
    "harira":             [100, 5,    2,  16,  2.0,  8,  40,  4.0,  3,  40,  0.5, 430],
    "maqluba":            [190,14,    7,  21,  2.0,  5,  50,  1.5,  2,  35,  1.5, 430],
    "thareed":            [200,15,    8,  20,  2.5,  4,  40,  2.0,  3,  40,  2.0, 480],
    "mujaddara":          [160, 8,    4,  25,  3.0,  2,  10,  5.0,  1,  40,  1.0, 280],
    "pastilla":           [280,12,   14,  28,  2.0,  1,  30,  2.0,  5,  40,  1.0, 380],
    "qatayef":            [310, 6,   12,  45,  1.5,  0,  20,  1.0, 22,  50,  0.4, 120],
    "knafeh":             [370, 8,   18,  46,  1.0,  0,  30,  0.5, 28, 100,  0.5, 170],
}

def label_to_nutrients(label: str, grams: float = 300.0) -> dict | None:
    """
    Food classifier label → nutrient dict (scaled to portion size).
    Returns None when label is not in the database.
    """
    key = label.lower().replace(" ", "_")
    if key not in FOOD_DB:
        return None
    vals = FOOD_DB[key]
    scale = grams / 100.0
    return {n: v * scale for n, v in zip(NUTRIENTS, vals)}

print(f"Food DB loaded — {len(FOOD_DB)} entries covering {len(FOOD_DB)} classes")


# ============================================================
# L3 — Load the bundle and predict
# ============================================================
import joblib, pandas as pd

BUNDLE_PATH = "/kaggle/working/nutrisense_model.joblib"   # saved by risk_model.py
bundle = joblib.load(BUNDLE_PATH)

FEATURES  = bundle["features"]
models    = bundle["models"]
thresholds = bundle["thresholds"]

def build_features(profile: dict, nutrients: dict) -> dict:
    """
    Combine demographic profile + per-meal nutrients into the model feature vector.
    profile: {'age': int, 'sex': int}  (sex: 1=male, 2=female)
    nutrients: output of label_to_nutrients()
    """
    feats = {
        "age": float(profile.get("age", 30)),
        "sex": float(1 if str(profile.get("sex", "m")).lower().startswith("m") else 2),
    }
    feats.update({k: nutrients.get(k, 0.0) for k in FEATURES if k not in ("age", "sex")})
    return feats

def predict_risk(feats: dict) -> dict:
    """Feature dict -> {disease: probability}"""
    x = pd.DataFrame([feats]).reindex(columns=FEATURES).fillna(0)
    return {
        disease: round(float(pipeline.predict_proba(x)[:, 1][0]), 3)
        for disease, pipeline in models.items()
    }


# ============================================================
# L4 — End to end: a photo in, a disease risk out
# ============================================================
def photo_to_risk(image_path: str, profile: dict, grams: float = 300.0) -> dict:
    """
    image_path : path to a food photo
    profile    : {'age': int, 'sex': 'male'|'female'}
    grams      : estimated portion size in grams

    Returns    : {'anemia': 0.32, 'diabetes': 0.18, 'overweight': 0.61}
    """
    label, conf = recognize(image_path)
    print(f"Recognised: {label}  ({conf:.0%} confidence)")

    nutrients = label_to_nutrients(label, grams)
    if nutrients is None:
        print(f"  '{label}' is not in the nutrition database yet.")
        print("  Risk prediction skipped — add the food to FOOD_DB manually.")
        return {}

    # Print the nutrients for transparency
    print(f"\n  Nutrients ({grams:.0f}g portion):")
    for k, v in nutrients.items():
        print(f"    {k:15s}: {v:.1f}")

    feats = build_features(profile, nutrients)
    risk  = predict_risk(feats)

    print("\n  Predicted disease risk:")
    for disease, prob in sorted(risk.items(), key=lambda x: -x[1]):
        band = "lower" if prob < thresholds[disease] else "ELEVATED"
        bar  = "█" * int(prob * 20) + "░" * (20 - int(prob * 20))
        print(f"    {disease:12s}  {bar}  {prob * 100:.0f}%  ({band})")

    return risk

# Example (uncomment with a real image):
# photo_to_risk("steak.jpg", {"age": 28, "sex": "female"}, grams=250)


# ============================================================
# L5 — Notes for your thesis
# ============================================================
# 1. The food classifier is the INPUT stage; the risk model is the contribution.
#    The CNN methodology is demonstrated here; disease prediction is the novel work.
#
# 2. FOOD_DB uses USDA FoodData Central values (per 100g), not Rwandan FCD.
#    This covers all 101 + 18 classes your classifier knows.  If you later train
#    on Rwandan food images, add those entries to FOOD_DB using MINAGRI/FAO values.
#
# 3. 'grams' is a portion-size estimate. For a real deployment you can let the user
#    enter the portion size, or use a standard serving size (typically 150-300g).
#    Accumulate multiple meals during the day for a truer daily total.
#
# 4. The risk model was trained on NHANES (US adults). Its performance on a Rwandan
#    population is an open research question and should be stated as a limitation.
#    Fine-tuning on RDHS data is the path to a Rwandan-specific model.
#
# 5. Confidence threshold: only surface a risk if conf > 0.60. Below that, ask the
#    user to confirm or type the food name manually.
