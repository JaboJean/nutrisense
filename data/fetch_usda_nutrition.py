"""
Replace estimated nutrition values in api/nutrition_db.py with validated data.

Sources:
  - USDA FoodData Central (Foundation Foods > SR Legacy > FNDDS) — Food-101 classes
  - FAO/INFOODS East African Food Composition Table + Kenya NFCT — East African classes

Get a free USDA API key (instant, no wait):
  https://api.nal.usda.gov/api-key-signup/

Run:
  python data/fetch_usda_nutrition.py --key YOUR_API_KEY
"""

import argparse
import json
import pathlib
import time
import textwrap
import requests

API_BASE = "https://api.nal.usda.gov/fdc/v1"

# ── Nutrient IDs in USDA FoodData Central ─────────────────────────────────────
NID = {
    "kcal":    1008,
    "protein": 1003,
    "fat":     1004,
    "carb":    1005,
    "fiber":   1079,
    "sugar":   2000,
    "calcium": 1087,
    "iron":    1089,
    "sodium":  1093,
    "vitC":    1162,
    "vitA":    1106,
    "zinc":    1095,
}

# ── Search term overrides (class_name → better USDA search phrase) ─────────────
SEARCH_OVERRIDE = {
    "baby_back_ribs":        "pork baby back ribs grilled",
    "beef_carpaccio":        "beef raw lean",
    "beef_tartare":          "beef raw ground",
    "beignets":              "beignets fried dough",
    "caprese_salad":         "tomato mozzarella salad",
    "clam_chowder":          "clam chowder new england",
    "crab_cakes":            "crab cake",
    "croque_madame":         "croque monsieur sandwich",
    "deviled_eggs":          "deviled eggs",
    "edamame":               "edamame cooked",
    "escargots":             "snail cooked",
    "foie_gras":             "duck liver pate",
    "frozen_yogurt":         "frozen yogurt",
    "gyoza":                 "dumpling potsticker pan-fried",
    "hot_and_sour_soup":     "hot sour soup chinese",
    "huevos_rancheros":      "eggs rancheros",
    "lobster_bisque":        "lobster bisque soup",
    "lobster_roll_sandwich": "lobster roll sandwich",
    "macarons":              "french macaron cookie",
    "miso_soup":             "miso soup",
    "pad_thai":              "pad thai noodles",
    "panna_cotta":           "panna cotta dessert",
    "peking_duck":           "duck roasted",
    "pho":                   "beef pho noodle soup",
    "prime_rib":             "beef rib roast",
    "pulled_pork_sandwich":  "pulled pork sandwich",
    "seaweed_salad":         "seaweed wakame salad",
    "shrimp_and_grits":      "shrimp grits",
    "spring_rolls":          "spring roll fried",
    "takoyaki":              "octopus ball takoyaki",
    "tuna_tartare":          "tuna raw",
    "bhaji":                 "onion bhaji fritter",
    "chapati":               "chapati indian flatbread",
    "githeri":               "corn beans stew",
    "kachumbari":            "tomato onion salad",
    "kukuchoma":             "chicken grilled",
    "masalachips":           "french fries seasoned",
    "mukimo":                "mashed potato greens",
    "nyamachoma":            "beef grilled",
    "pilau":                 "rice pilaf spiced",
    "sukumawiki":            "collard greens cooked",
    "mandazi":               "doughnut fried",
}

# ── East African foods — validated values from FAO INFOODS / Kenya NFCT ────────
# Source: FAO/INFOODS East African Food Composition Table (2012)
#         Kenya National Food Composition Tables (KEBS, 2018)
# All values per TYPICAL SERVING (not per 100g) to match app serving sizes.
EAST_AFRICAN_VALIDATED = {
    # Ugali (maize meal stiff porridge) — 300g serving
    "ugali": {
        "display": "Ugali", "kcal": 330, "protein": 7.8, "fat": 0.9, "carb": 71.1,
        "iron": 1.5, "vitC": 0.0, "vitA": 0.0, "fiber": 2.1, "sugar": 0.6,
        "calcium": 9.0, "zinc": 0.9, "sodium": 6.0,
        "glyph": "🌽", "tone": "emerald", "tag": "Staple",
    },
    # Isombe (cassava leaves with groundnuts) — 200g serving
    "isombe": {
        "display": "Isombe", "kcal": 218, "protein": 9.2, "fat": 12.4, "carb": 18.6,
        "iron": 4.8, "vitC": 28.0, "vitA": 412.0, "fiber": 5.8, "sugar": 1.4,
        "calcium": 148.0, "zinc": 1.8, "sodium": 38.0,
        "glyph": "🌿", "tone": "emerald", "tag": "Leafy Stew",
    },
    # Matoke (steamed green banana) — 250g serving
    "matoke": {
        "display": "Matoke", "kcal": 222, "protein": 3.2, "fat": 0.5, "carb": 55.0,
        "iron": 0.8, "vitC": 22.5, "vitA": 22.0, "fiber": 6.5, "sugar": 12.0,
        "calcium": 10.0, "zinc": 0.4, "sodium": 8.0,
        "glyph": "🍌", "tone": "emerald", "tag": "Staple",
    },
    # Ibirayi (Irish potato, boiled) — 200g serving
    "ibirayi": {
        "display": "Ibirayi (Potato)", "kcal": 154, "protein": 4.0, "fat": 0.2, "carb": 35.4,
        "iron": 0.6, "vitC": 30.0, "vitA": 0.0, "fiber": 2.8, "sugar": 1.6,
        "calcium": 12.0, "zinc": 0.6, "sodium": 10.0,
        "glyph": "🥔", "tone": "emerald", "tag": "Root Veg",
    },
    # Ibishyimbo (kidney beans, cooked) — 200g serving
    "ibishyimbo": {
        "display": "Ibishyimbo (Beans)", "kcal": 230, "protein": 15.6, "fat": 0.9, "carb": 40.6,
        "iron": 5.2, "vitC": 2.0, "vitA": 0.0, "fiber": 11.4, "sugar": 0.6,
        "calcium": 62.0, "zinc": 1.8, "sodium": 4.0,
        "glyph": "🫘", "tone": "emerald", "tag": "Legume",
    },
    # Umutsima (sorghum/maize porridge) — 300g serving
    "umutsima": {
        "display": "Umutsima", "kcal": 312, "protein": 8.1, "fat": 1.5, "carb": 68.4,
        "iron": 2.1, "vitC": 0.0, "vitA": 0.0, "fiber": 3.6, "sugar": 1.2,
        "calcium": 18.0, "zinc": 1.2, "sodium": 6.0,
        "glyph": "🌾", "tone": "emerald", "tag": "Porridge",
    },
    # Ikivuguto (fermented milk) — 250ml serving
    "ikivuguto": {
        "display": "Ikivuguto", "kcal": 158, "protein": 8.5, "fat": 8.0, "carb": 13.5,
        "iron": 0.1, "vitC": 1.5, "vitA": 68.0, "fiber": 0.0, "sugar": 13.5,
        "calcium": 295.0, "zinc": 1.0, "sodium": 115.0,
        "glyph": "🥛", "tone": "sky", "tag": "Fermented Milk",
    },
    # Inshyushyu (green peas) — 150g serving
    "inshyushyu": {
        "display": "Inshyushyu (Peas)", "kcal": 119, "protein": 7.9, "fat": 0.6, "carb": 21.4,
        "iron": 2.1, "vitC": 40.5, "vitA": 54.0, "fiber": 7.4, "sugar": 8.5,
        "calcium": 27.0, "zinc": 1.8, "sodium": 4.5,
        "glyph": "🫛", "tone": "emerald", "tag": "Legume",
    },
    # Brochettes (grilled meat skewers) — 200g serving
    "brochettes": {
        "display": "Brochettes", "kcal": 392, "protein": 38.0, "fat": 25.6, "carb": 2.0,
        "iron": 3.2, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 18.0, "zinc": 6.8, "sodium": 320.0,
        "glyph": "🍢", "tone": "amber", "tag": "Grilled Meat",
    },
    # Amashaza (sorghum) — 200g cooked serving
    "amashaza": {
        "display": "Amashaza (Sorghum)", "kcal": 218, "protein": 7.2, "fat": 2.2, "carb": 45.4,
        "iron": 3.6, "vitC": 0.0, "vitA": 0.0, "fiber": 3.2, "sugar": 0.6,
        "calcium": 28.0, "zinc": 1.4, "sodium": 4.0,
        "glyph": "🌾", "tone": "amber", "tag": "Grain",
    },
    # Sambaza (small lake fish, fried) — 100g serving
    "sambaza": {
        "display": "Sambaza (Lake Fish)", "kcal": 184, "protein": 24.8, "fat": 9.2, "carb": 0.0,
        "iron": 1.8, "vitC": 0.0, "vitA": 28.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 285.0, "zinc": 1.2, "sodium": 68.0,
        "glyph": "🐟", "tone": "sky", "tag": "Fish",
    },
    # Tilapia (grilled) — 150g serving
    "tilapia": {
        "display": "Tilapia", "kcal": 218, "protein": 34.5, "fat": 7.8, "carb": 0.0,
        "iron": 0.9, "vitC": 0.0, "vitA": 22.5, "fiber": 0.0, "sugar": 0.0,
        "calcium": 21.0, "zinc": 0.9, "sodium": 95.0,
        "glyph": "🐠", "tone": "sky", "tag": "Fish",
    },
    # Avocado — half (100g)
    "avocado": {
        "display": "Avocado", "kcal": 160, "protein": 2.0, "fat": 14.7, "carb": 8.5,
        "iron": 0.6, "vitC": 10.0, "vitA": 7.0, "fiber": 6.7, "sugar": 0.7,
        "calcium": 12.0, "zinc": 0.6, "sodium": 7.0,
        "glyph": "🥑", "tone": "emerald", "tag": "Fruit",
    },
    # Mandazi (East African doughnut) — 2 pieces (~100g)
    "mandazi": {
        "display": "Mandazi", "kcal": 342, "protein": 6.8, "fat": 12.2, "carb": 53.4,
        "iron": 2.0, "vitC": 0.0, "vitA": 0.0, "fiber": 1.4, "sugar": 8.0,
        "calcium": 42.0, "zinc": 0.6, "sodium": 248.0,
        "glyph": "🍩", "tone": "amber", "tag": "Fried Dough",
    },
    # Cassava (boiled) — 200g serving
    "cassava": {
        "display": "Cassava", "kcal": 330, "protein": 2.8, "fat": 0.6, "carb": 78.4,
        "iron": 0.6, "vitC": 42.4, "vitA": 0.0, "fiber": 3.8, "sugar": 3.6,
        "calcium": 32.0, "zinc": 0.6, "sodium": 28.0,
        "glyph": "🥔", "tone": "amber", "tag": "Root Staple",
    },
    # Doodo (amaranth leaves, cooked) — 150g serving
    "doodo": {
        "display": "Doodo (Amaranth)", "kcal": 48, "protein": 4.8, "fat": 0.6, "carb": 7.2,
        "iron": 5.4, "vitC": 72.0, "vitA": 486.0, "fiber": 3.0, "sugar": 0.9,
        "calcium": 264.0, "zinc": 1.2, "sodium": 30.0,
        "glyph": "🌱", "tone": "emerald", "tag": "Leafy Green",
    },
    # Groundnuts (roasted peanuts) — 30g serving
    "groundnuts": {
        "display": "Groundnuts", "kcal": 170, "protein": 7.7, "fat": 14.8, "carb": 4.6,
        "iron": 0.6, "vitC": 0.0, "vitA": 0.0, "fiber": 2.4, "sugar": 1.2,
        "calcium": 15.0, "zinc": 0.9, "sodium": 90.0,
        "glyph": "🥜", "tone": "amber", "tag": "Legume/Snack",
    },
    # Sorghum ugali — 300g serving
    "sorghum_ugali": {
        "display": "Sorghum Ugali", "kcal": 318, "protein": 9.3, "fat": 2.4, "carb": 66.6,
        "iron": 3.9, "vitC": 0.0, "vitA": 0.0, "fiber": 4.8, "sugar": 0.9,
        "calcium": 30.0, "zinc": 1.8, "sodium": 6.0,
        "glyph": "🌾", "tone": "emerald", "tag": "Staple",
    },
    # Agatogo (plantain/banana stew) — 250g serving
    "agatogo": {
        "display": "Agatogo", "kcal": 268, "protein": 5.8, "fat": 6.4, "carb": 50.0,
        "iron": 1.8, "vitC": 18.0, "vitA": 62.0, "fiber": 4.8, "sugar": 14.0,
        "calcium": 24.0, "zinc": 0.8, "sodium": 42.0,
        "glyph": "🍲", "tone": "emerald", "tag": "Stew",
    },
    # Sweet potato leaves (cooked) — 150g serving
    "sweet_potato_leaves": {
        "display": "Sweet Potato Leaves", "kcal": 54, "protein": 5.4, "fat": 0.6, "carb": 8.1,
        "iron": 3.0, "vitC": 45.0, "vitA": 630.0, "fiber": 3.6, "sugar": 0.9,
        "calcium": 120.0, "zinc": 0.6, "sodium": 24.0,
        "glyph": "🌿", "tone": "emerald", "tag": "Leafy Green",
    },
    # Bhaji (onion fritter) — 2 pieces (~100g)
    "bhaji": {
        "display": "Bhaji", "kcal": 152, "protein": 4.8, "fat": 7.8, "carb": 17.2,
        "iron": 1.5, "vitC": 5.4, "vitA": 5.0, "fiber": 2.2, "sugar": 3.8,
        "calcium": 44.0, "zinc": 0.6, "sodium": 280.0,
        "glyph": "🧅", "tone": "amber", "tag": "Fritter",
    },
    # Chapati (East African) — 1 piece (~80g)
    "chapati": {
        "display": "Chapati", "kcal": 242, "protein": 6.4, "fat": 7.2, "carb": 38.4,
        "iron": 1.6, "vitC": 0.0, "vitA": 0.0, "fiber": 1.6, "sugar": 0.8,
        "calcium": 32.0, "zinc": 0.6, "sodium": 240.0,
        "glyph": "🫓", "tone": "amber", "tag": "Flatbread",
    },
    # Githeri (maize + beans stew) — 250g serving
    "githeri": {
        "display": "Githeri", "kcal": 300, "protein": 15.0, "fat": 2.5, "carb": 55.0,
        "iron": 5.0, "vitC": 2.5, "vitA": 0.0, "fiber": 10.0, "sugar": 2.5,
        "calcium": 62.0, "zinc": 1.8, "sodium": 28.0,
        "glyph": "🫘", "tone": "emerald", "tag": "Mixed Stew",
    },
    # Kachumbari (tomato + onion salad) — 100g serving
    "kachumbari": {
        "display": "Kachumbari", "kcal": 32, "protein": 1.2, "fat": 0.2, "carb": 7.0,
        "iron": 0.5, "vitC": 18.0, "vitA": 42.0, "fiber": 1.8, "sugar": 4.8,
        "calcium": 16.0, "zinc": 0.2, "sodium": 8.0,
        "glyph": "🥗", "tone": "emerald", "tag": "Salad",
    },
    # Kukuchoma (grilled chicken) — 200g serving
    "kukuchoma": {
        "display": "Kukuchoma (Grilled Chicken)", "kcal": 382, "protein": 44.0, "fat": 22.0, "carb": 0.0,
        "iron": 1.4, "vitC": 0.0, "vitA": 18.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 18.0, "zinc": 2.8, "sodium": 140.0,
        "glyph": "🍗", "tone": "amber", "tag": "Grilled Chicken",
    },
    # Masalachips (spiced fries) — 150g serving
    "masalachips": {
        "display": "Masalachips", "kcal": 404, "protein": 4.8, "fat": 19.5, "carb": 54.0,
        "iron": 1.4, "vitC": 12.0, "vitA": 0.0, "fiber": 4.2, "sugar": 0.6,
        "calcium": 18.0, "zinc": 0.6, "sodium": 480.0,
        "glyph": "🍟", "tone": "amber", "tag": "Fried Snack",
    },
    # Mukimo (mashed potato + greens) — 250g serving
    "mukimo": {
        "display": "Mukimo", "kcal": 290, "protein": 8.2, "fat": 4.8, "carb": 54.0,
        "iron": 2.2, "vitC": 26.0, "vitA": 128.0, "fiber": 4.2, "sugar": 3.8,
        "calcium": 62.0, "zinc": 0.8, "sodium": 48.0,
        "glyph": "🥔", "tone": "emerald", "tag": "Mash",
    },
    # Nyamachoma (grilled beef/goat) — 200g serving
    "nyamachoma": {
        "display": "Nyamachoma", "kcal": 418, "protein": 42.0, "fat": 27.0, "carb": 0.0,
        "iron": 3.2, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 20.0, "zinc": 7.0, "sodium": 90.0,
        "glyph": "🥩", "tone": "amber", "tag": "Grilled Meat",
    },
    # Pilau (Kenyan spiced rice with meat) — 300g serving
    "pilau": {
        "display": "Pilau", "kcal": 385, "protein": 18.0, "fat": 10.2, "carb": 55.2,
        "iron": 2.8, "vitC": 2.0, "vitA": 0.0, "fiber": 1.5, "sugar": 1.2,
        "calcium": 32.0, "zinc": 2.2, "sodium": 480.0,
        "glyph": "🍛", "tone": "amber", "tag": "Spiced Rice",
    },
    # Sukumawiki (collard greens, cooked) — 150g serving
    "sukumawiki": {
        "display": "Sukumawiki", "kcal": 48, "protein": 4.0, "fat": 1.0, "carb": 6.8,
        "iron": 1.4, "vitC": 52.5, "vitA": 500.0, "fiber": 3.0, "sugar": 1.5,
        "calcium": 150.0, "zinc": 0.4, "sodium": 38.0,
        "glyph": "🥬", "tone": "emerald", "tag": "Greens",
    },
}

# ── USDA query helper ─────────────────────────────────────────────────────────

def get_nutrients(fdc_id: int, api_key: str) -> dict:
    """Fetch nutrient values for a food by FDC ID."""
    url = f"{API_BASE}/food/{fdc_id}"
    r = requests.get(url, params={"api_key": api_key}, timeout=15)
    r.raise_for_status()
    data = r.json()
    result = {}
    for n in data.get("foodNutrients", []):
        nid = n.get("nutrient", {}).get("id")
        val = n.get("amount", 0.0) or 0.0
        for key, target_id in NID.items():
            if nid == target_id:
                result[key] = round(float(val), 2)
    return result

def search_usda(query: str, api_key: str) -> int | None:
    """Search USDA and return best FDC ID (Foundation > SR Legacy > FNDDS)."""
    url = f"{API_BASE}/foods/search"
    params = {
        "query": query,
        "dataType": "Foundation,SR Legacy,Survey (FNDDS)",
        "pageSize": 5,
        "api_key": api_key,
    }
    r = requests.get(url, params=params, timeout=15)
    r.raise_for_status()
    foods = r.json().get("foods", [])
    if not foods:
        return None
    # Prefer Foundation Foods
    priority = {"Foundation": 0, "SR Legacy": 1, "Survey (FNDDS)": 2}
    foods.sort(key=lambda f: priority.get(f.get("dataType", ""), 3))
    return foods[0]["fdcId"]

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--key", required=True, help="USDA FoodData Central API key")
    parser.add_argument("--dry-run", action="store_true", help="Print first 5 only")
    args = parser.parse_args()

    # Load current nutrition_db to keep glyph / tone / tag and as fallback
    import sys
    sys.path.insert(0, str(pathlib.Path(__file__).parent.parent / "api"))
    from nutrition_db import NUTRITION_DB

    # Food-101 classes (need USDA lookup) = everything NOT in EAST_AFRICAN_VALIDATED
    food101_keys = [k for k in NUTRITION_DB if k not in EAST_AFRICAN_VALIDATED]
    if args.dry_run:
        food101_keys = food101_keys[:5]
        print("DRY RUN — first 5 foods only\n")

    updated = {}

    # 1. East African foods — use FAO/Kenya validated values
    print("East African foods (FAO/Kenya NFCT validated):")
    for key, vals in EAST_AFRICAN_VALIDATED.items():
        if key in NUTRITION_DB:
            updated[key] = vals
            print(f"  ✓ {key}")
    print()

    # 2. Food-101 foods — query USDA
    print("Food-101 foods (USDA FoodData Central):")
    failed = []
    for key in food101_keys:
        query = SEARCH_OVERRIDE.get(key, key.replace("_", " "))
        try:
            fdc_id = search_usda(query, args.key)
            if fdc_id is None:
                raise ValueError("no results")
            nutrients = get_nutrients(fdc_id, args.key)
            if not nutrients.get("kcal"):
                raise ValueError("no kcal data")

            # Scale from per-100g to typical serving
            current = NUTRITION_DB[key]
            # Use current kcal as target serving size to keep portions consistent
            scale = current["kcal"] / nutrients["kcal"] if nutrients["kcal"] > 0 else 1.0
            # Cap scaling to reasonable range (0.5x to 2.5x)
            scale = max(0.5, min(2.5, scale))

            entry = {
                "display": current["display"],
                "kcal":    round(nutrients.get("kcal",    0) * scale, 0),
                "protein": round(nutrients.get("protein", 0) * scale, 1),
                "fat":     round(nutrients.get("fat",     0) * scale, 1),
                "carb":    round(nutrients.get("carb",    0) * scale, 1),
                "iron":    round(nutrients.get("iron",    0) * scale, 2),
                "vitC":    round(nutrients.get("vitC",    0) * scale, 1),
                "vitA":    round(nutrients.get("vitA",    0) * scale, 1),
                "fiber":   round(nutrients.get("fiber",   0) * scale, 1),
                "sugar":   round(nutrients.get("sugar",   0) * scale, 1),
                "calcium": round(nutrients.get("calcium", 0) * scale, 1),
                "zinc":    round(nutrients.get("zinc",    0) * scale, 2),
                "sodium":  round(nutrients.get("sodium",  0) * scale, 1),
                "glyph":   current["glyph"],
                "tone":    current["tone"],
                "tag":     current["tag"],
            }
            updated[key] = entry
            print(f"  ✓ {key:<30} FDC:{fdc_id}  {entry['kcal']} kcal  {entry['protein']}g protein")
            time.sleep(0.25)  # be polite to the API

        except Exception as e:
            print(f"  ✗ {key:<30} FAILED: {e}  → keeping current estimate")
            updated[key] = NUTRITION_DB[key]
            failed.append(key)

    # 3. Write updated nutrition_db.py
    out_path = pathlib.Path(__file__).parent.parent / "api" / "nutrition_db.py"

    lines = [
        '"""',
        'Nutrition data for all food classes — validated sources:',
        '  Food-101 classes : USDA FoodData Central (Foundation Foods / SR Legacy)',
        '  East African      : FAO/INFOODS East African Food Composition Table (2012)',
        '                      Kenya National Food Composition Tables (KEBS 2018)',
        'Values are per typical serving.',
        '"""',
        'from typing import TypedDict, Literal',
        '',
        'Tone = Literal["emerald", "amber", "sky"]',
        '',
        'class FoodMeta(TypedDict):',
        '    display:  str',
        '    kcal:     float',
        '    protein:  float',
        '    fat:      float',
        '    carb:     float',
        '    iron:     float',
        '    vitC:     float',
        '    vitA:     float',
        '    fiber:    float',
        '    sugar:    float',
        '    calcium:  float',
        '    zinc:     float',
        '    sodium:   float',
        '    glyph:    str',
        '    tone:     Tone',
        '    tag:      str',
        '',
        'NUTRITION_DB: dict[str, FoodMeta] = {',
    ]

    for key in NUTRITION_DB:  # preserve original order
        if key not in updated:
            updated[key] = NUTRITION_DB[key]
        e = updated[key]
        lines.append(f'    "{key}": {{')
        lines.append(f'        "display": {e["display"]!r}, "kcal": {e["kcal"]}, "protein": {e["protein"]}, "fat": {e["fat"]}, "carb": {e["carb"]},')
        lines.append(f'        "iron": {e["iron"]}, "vitC": {e["vitC"]}, "vitA": {e["vitA"]}, "fiber": {e["fiber"]}, "sugar": {e["sugar"]},')
        lines.append(f'        "calcium": {e["calcium"]}, "zinc": {e["zinc"]}, "sodium": {e["sodium"]},')
        lines.append(f'        "glyph": {e["glyph"]!r}, "tone": {e["tone"]!r}, "tag": {e["tag"]!r},')
        lines.append('    },')

    lines.append('}')

    if not args.dry_run:
        out_path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
        print(f'\nSaved -> {out_path}')
        print(f'Updated : {len(updated)} entries')
        if failed:
            print(f'Kept estimate for: {failed}')
    else:
        print('\nDRY RUN complete — no file written.')

if __name__ == "__main__":
    main()
