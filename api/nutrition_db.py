"""
Nutrition data + UI metadata for all classifier food classes.

Food-101 values: USDA SR Legacy database, scaled to typical restaurant/home serving sizes.
East African values: FAO/INFOODS East African Food Composition Table (2012)
                     and Kenya NFCT (KEBS 2018), per 1 cup / typical home portion.
Keys match class_names.txt exactly (underscore, lower-case).
"""
from typing import TypedDict, Literal

Tone = Literal["emerald", "amber", "sky"]

class FoodMeta(TypedDict):
    display:  str
    kcal:     float   # kcal per serving
    protein:  float   # g
    fat:      float   # g
    carb:     float   # g
    iron:     float   # mg
    vitC:     float   # mg
    vitA:     float   # mcg RAE
    fiber:    float   # g
    sugar:    float   # g
    calcium:  float   # mg
    zinc:     float   # mg
    sodium:   float   # mg
    glyph:    str
    tone:     Tone
    tag:      str

NUTRITION_DB: dict[str, FoodMeta] = {
    # ── Food-101 classes (USDA SR Legacy, per typical restaurant/home serving) ──
    "apple_pie": {
        "display": "Apple Pie", "kcal": 277, "protein": 2.4, "fat": 13.0, "carb": 40.0,
        "iron": 1.0, "vitC": 1.7, "vitA": 17.0, "fiber": 1.4, "sugar": 20.0,
        "calcium": 9.0, "zinc": 0.2, "sodium": 333.0,
        "glyph": "🥧", "tone": "amber", "tag": "Dessert",
    },
    "baby_back_ribs": {
        "display": "Baby Back Ribs", "kcal": 388, "protein": 29.0, "fat": 30.0, "carb": 1.0,
        "iron": 1.9, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 29.0, "zinc": 4.2, "sodium": 582.0,
        "glyph": "🍖", "tone": "amber", "tag": "BBQ",
    },
    "baklava": {
        "display": "Baklava", "kcal": 334, "protein": 4.4, "fat": 23.0, "carb": 29.0,
        "iron": 1.4, "vitC": 0.0, "vitA": 12.0, "fiber": 1.6, "sugar": 18.0,
        "calcium": 37.0, "zinc": 0.8, "sodium": 160.0,
        "glyph": "🍯", "tone": "amber", "tag": "Pastry",
    },
    "beef_carpaccio": {
        "display": "Beef Carpaccio", "kcal": 143, "protein": 16.0, "fat": 8.0, "carb": 0.0,
        "iron": 1.8, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 6.0, "zinc": 3.3, "sodium": 290.0,
        "glyph": "🥩", "tone": "sky", "tag": "Raw Beef",
    },
    "beef_tartare": {
        "display": "Beef Tartare", "kcal": 163, "protein": 21.0, "fat": 8.0, "carb": 1.0,
        "iron": 2.6, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 7.0, "zinc": 4.4, "sodium": 340.0,
        "glyph": "🥩", "tone": "sky", "tag": "Raw Beef",
    },
    "beet_salad": {
        "display": "Beet Salad", "kcal": 98, "protein": 2.6, "fat": 5.5, "carb": 12.0,
        "iron": 1.0, "vitC": 5.6, "vitA": 2.0, "fiber": 2.8, "sugar": 9.2,
        "calcium": 20.0, "zinc": 0.4, "sodium": 234.0,
        "glyph": "🥗", "tone": "emerald", "tag": "Salad",
    },
    "beignets": {
        "display": "Beignets", "kcal": 306, "protein": 4.8, "fat": 16.0, "carb": 37.0,
        "iron": 1.5, "vitC": 0.0, "vitA": 0.0, "fiber": 0.9, "sugar": 14.0,
        "calcium": 46.0, "zinc": 0.4, "sodium": 270.0,
        "glyph": "🍩", "tone": "amber", "tag": "Fried Dough",
    },
    "bibimbap": {
        "display": "Bibimbap", "kcal": 490, "protein": 22.0, "fat": 15.0, "carb": 65.0,
        "iron": 3.5, "vitC": 12.0, "vitA": 80.0, "fiber": 4.0, "sugar": 6.0,
        "calcium": 60.0, "zinc": 2.5, "sodium": 870.0,
        "glyph": "🍚", "tone": "emerald", "tag": "Korean Bowl",
    },
    "bread_pudding": {
        "display": "Bread Pudding", "kcal": 264, "protein": 7.4, "fat": 9.1, "carb": 39.0,
        "iron": 1.5, "vitC": 0.0, "vitA": 74.0, "fiber": 0.8, "sugar": 19.0,
        "calcium": 114.0, "zinc": 0.7, "sodium": 304.0,
        "glyph": "🍞", "tone": "amber", "tag": "Dessert",
    },
    "breakfast_burrito": {
        "display": "Breakfast Burrito", "kcal": 345, "protein": 16.0, "fat": 16.0, "carb": 35.0,
        "iron": 2.4, "vitC": 4.0, "vitA": 90.0, "fiber": 2.5, "sugar": 2.5,
        "calcium": 140.0, "zinc": 2.0, "sodium": 740.0,
        "glyph": "🌯", "tone": "amber", "tag": "Breakfast",
    },
    "bruschetta": {
        "display": "Bruschetta", "kcal": 167, "protein": 4.3, "fat": 6.5, "carb": 23.0,
        "iron": 1.2, "vitC": 9.5, "vitA": 38.0, "fiber": 1.8, "sugar": 3.5,
        "calcium": 46.0, "zinc": 0.5, "sodium": 298.0,
        "glyph": "🍅", "tone": "emerald", "tag": "Appetizer",
    },
    "caesar_salad": {
        "display": "Caesar Salad", "kcal": 190, "protein": 7.8, "fat": 16.0, "carb": 6.0,
        "iron": 1.7, "vitC": 14.5, "vitA": 138.0, "fiber": 2.1, "sugar": 1.8,
        "calcium": 118.0, "zinc": 0.8, "sodium": 536.0,
        "glyph": "🥗", "tone": "emerald", "tag": "Salad",
    },
    "cannoli": {
        "display": "Cannoli", "kcal": 357, "protein": 8.2, "fat": 19.0, "carb": 40.0,
        "iron": 0.7, "vitC": 0.0, "vitA": 38.0, "fiber": 0.6, "sugar": 24.0,
        "calcium": 84.0, "zinc": 0.6, "sodium": 175.0,
        "glyph": "🍮", "tone": "amber", "tag": "Italian Dessert",
    },
    "caprese_salad": {
        "display": "Caprese Salad", "kcal": 196, "protein": 12.0, "fat": 14.0, "carb": 4.5,
        "iron": 0.4, "vitC": 17.0, "vitA": 52.0, "fiber": 0.9, "sugar": 3.0,
        "calcium": 316.0, "zinc": 1.0, "sodium": 398.0,
        "glyph": "🍅", "tone": "emerald", "tag": "Salad",
    },
    "carrot_cake": {
        "display": "Carrot Cake", "kcal": 448, "protein": 4.4, "fat": 21.0, "carb": 61.0,
        "iron": 1.2, "vitC": 1.0, "vitA": 118.0, "fiber": 1.3, "sugar": 42.0,
        "calcium": 54.0, "zinc": 0.4, "sodium": 388.0,
        "glyph": "🎂", "tone": "amber", "tag": "Dessert",
    },
    "ceviche": {
        "display": "Ceviche", "kcal": 124, "protein": 18.5, "fat": 1.5, "carb": 9.0,
        "iron": 0.9, "vitC": 22.0, "vitA": 13.0, "fiber": 1.2, "sugar": 2.8,
        "calcium": 28.0, "zinc": 1.6, "sodium": 512.0,
        "glyph": "🐟", "tone": "sky", "tag": "Seafood",
    },
    "cheese_plate": {
        "display": "Cheese Plate", "kcal": 371, "protein": 21.0, "fat": 30.0, "carb": 2.0,
        "iron": 0.3, "vitC": 0.0, "vitA": 218.0, "fiber": 0.0, "sugar": 0.2,
        "calcium": 721.0, "zinc": 2.9, "sodium": 646.0,
        "glyph": "🧀", "tone": "sky", "tag": "Dairy",
    },
    "cheesecake": {
        "display": "Cheesecake", "kcal": 321, "protein": 5.5, "fat": 22.0, "carb": 26.0,
        "iron": 0.4, "vitC": 0.4, "vitA": 208.0, "fiber": 0.2, "sugar": 18.0,
        "calcium": 59.0, "zinc": 0.5, "sodium": 234.0,
        "glyph": "🍰", "tone": "amber", "tag": "Dessert",
    },
    "chicken_curry": {
        "display": "Chicken Curry", "kcal": 280, "protein": 27.0, "fat": 14.0, "carb": 11.0,
        "iron": 2.1, "vitC": 7.5, "vitA": 62.0, "fiber": 2.3, "sugar": 3.5,
        "calcium": 38.0, "zinc": 2.4, "sodium": 700.0,
        "glyph": "🍛", "tone": "amber", "tag": "Curry",
    },
    "chicken_quesadilla": {
        "display": "Chicken Quesadilla", "kcal": 366, "protein": 26.0, "fat": 18.0, "carb": 25.0,
        "iron": 1.6, "vitC": 2.5, "vitA": 62.0, "fiber": 1.4, "sugar": 1.5,
        "calcium": 262.0, "zinc": 2.1, "sodium": 668.0,
        "glyph": "🌮", "tone": "amber", "tag": "Mexican",
    },
    "chicken_wings": {
        "display": "Chicken Wings", "kcal": 294, "protein": 27.4, "fat": 19.5, "carb": 0.0,
        "iron": 1.1, "vitC": 0.0, "vitA": 29.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 15.0, "zinc": 2.4, "sodium": 492.0,
        "glyph": "🍗", "tone": "amber", "tag": "Fried Chicken",
    },
    "chocolate_cake": {
        "display": "Chocolate Cake", "kcal": 367, "protein": 5.0, "fat": 16.0, "carb": 54.0,
        "iron": 2.3, "vitC": 0.0, "vitA": 14.0, "fiber": 2.0, "sugar": 36.0,
        "calcium": 37.0, "zinc": 0.8, "sodium": 299.0,
        "glyph": "🎂", "tone": "amber", "tag": "Dessert",
    },
    "chocolate_mousse": {
        "display": "Chocolate Mousse", "kcal": 260, "protein": 4.2, "fat": 19.0, "carb": 22.0,
        "iron": 1.8, "vitC": 0.0, "vitA": 74.0, "fiber": 1.4, "sugar": 18.0,
        "calcium": 56.0, "zinc": 0.6, "sodium": 52.0,
        "glyph": "🍫", "tone": "amber", "tag": "Dessert",
    },
    "churros": {
        "display": "Churros", "kcal": 376, "protein": 4.8, "fat": 19.0, "carb": 47.0,
        "iron": 1.6, "vitC": 0.0, "vitA": 0.0, "fiber": 1.4, "sugar": 11.0,
        "calcium": 40.0, "zinc": 0.4, "sodium": 200.0,
        "glyph": "🍩", "tone": "amber", "tag": "Spanish Dessert",
    },
    "clam_chowder": {
        "display": "Clam Chowder", "kcal": 168, "protein": 8.7, "fat": 7.5, "carb": 17.0,
        "iron": 3.2, "vitC": 4.5, "vitA": 37.0, "fiber": 0.9, "sugar": 3.6,
        "calcium": 86.0, "zinc": 1.8, "sodium": 688.0,
        "glyph": "🍲", "tone": "sky", "tag": "Seafood Soup",
    },
    "club_sandwich": {
        "display": "Club Sandwich", "kcal": 456, "protein": 29.0, "fat": 21.0, "carb": 38.0,
        "iron": 2.6, "vitC": 4.5, "vitA": 54.0, "fiber": 2.4, "sugar": 4.5,
        "calcium": 88.0, "zinc": 2.6, "sodium": 1068.0,
        "glyph": "🥪", "tone": "amber", "tag": "Sandwich",
    },
    "crab_cakes": {
        "display": "Crab Cakes", "kcal": 187, "protein": 15.0, "fat": 9.5, "carb": 9.5,
        "iron": 0.6, "vitC": 2.8, "vitA": 20.0, "fiber": 0.4, "sugar": 0.8,
        "calcium": 96.0, "zinc": 2.9, "sodium": 506.0,
        "glyph": "🦀", "tone": "sky", "tag": "Seafood",
    },
    "creme_brulee": {
        "display": "Crème Brûlée", "kcal": 285, "protein": 4.6, "fat": 19.0, "carb": 25.0,
        "iron": 0.2, "vitC": 0.0, "vitA": 168.0, "fiber": 0.0, "sugar": 22.0,
        "calcium": 86.0, "zinc": 0.4, "sodium": 48.0,
        "glyph": "🍮", "tone": "amber", "tag": "French Dessert",
    },
    "croque_madame": {
        "display": "Croque Madame", "kcal": 430, "protein": 24.0, "fat": 24.0, "carb": 28.0,
        "iron": 2.1, "vitC": 0.6, "vitA": 138.0, "fiber": 1.3, "sugar": 4.2,
        "calcium": 296.0, "zinc": 2.4, "sodium": 940.0,
        "glyph": "🥪", "tone": "amber", "tag": "French Sandwich",
    },
    "cup_cakes": {
        "display": "Cupcakes", "kcal": 389, "protein": 4.2, "fat": 17.0, "carb": 56.0,
        "iron": 1.1, "vitC": 0.1, "vitA": 38.0, "fiber": 0.6, "sugar": 38.0,
        "calcium": 57.0, "zinc": 0.4, "sodium": 314.0,
        "glyph": "🧁", "tone": "amber", "tag": "Dessert",
    },
    "deviled_eggs": {
        "display": "Deviled Eggs", "kcal": 177, "protein": 11.6, "fat": 13.5, "carb": 1.8,
        "iron": 1.4, "vitC": 0.0, "vitA": 108.0, "fiber": 0.0, "sugar": 0.8,
        "calcium": 36.0, "zinc": 1.0, "sodium": 326.0,
        "glyph": "🥚", "tone": "sky", "tag": "Egg Dish",
    },
    "donuts": {
        "display": "Donuts", "kcal": 452, "protein": 4.9, "fat": 25.0, "carb": 51.0,
        "iron": 1.9, "vitC": 0.0, "vitA": 0.0, "fiber": 1.3, "sugar": 21.0,
        "calcium": 48.0, "zinc": 0.5, "sodium": 356.0,
        "glyph": "🍩", "tone": "amber", "tag": "Dessert",
    },
    "dumplings": {
        "display": "Dumplings", "kcal": 242, "protein": 11.0, "fat": 8.5, "carb": 32.0,
        "iron": 1.7, "vitC": 1.5, "vitA": 10.0, "fiber": 1.4, "sugar": 1.5,
        "calcium": 38.0, "zinc": 1.1, "sodium": 524.0,
        "glyph": "🥟", "tone": "amber", "tag": "Asian",
    },
    "edamame": {
        "display": "Edamame", "kcal": 189, "protein": 16.9, "fat": 8.1, "carb": 13.8,
        "iron": 3.5, "vitC": 14.4, "vitA": 14.0, "fiber": 8.1, "sugar": 3.3,
        "calcium": 98.0, "zinc": 2.1, "sodium": 9.0,
        "glyph": "🫘", "tone": "emerald", "tag": "Plant Protein",
    },
    "eggs_benedict": {
        "display": "Eggs Benedict", "kcal": 364, "protein": 17.5, "fat": 24.0, "carb": 21.0,
        "iron": 2.4, "vitC": 0.8, "vitA": 148.0, "fiber": 0.9, "sugar": 1.8,
        "calcium": 62.0, "zinc": 1.5, "sodium": 848.0,
        "glyph": "🥚", "tone": "sky", "tag": "Breakfast",
    },
    "escargots": {
        "display": "Escargots", "kcal": 102, "protein": 17.5, "fat": 2.1, "carb": 2.0,
        "iron": 3.0, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 170.0, "zinc": 1.5, "sodium": 295.0,
        "glyph": "🐌", "tone": "sky", "tag": "French",
    },
    "falafel": {
        "display": "Falafel", "kcal": 333, "protein": 13.3, "fat": 17.8, "carb": 31.8,
        "iron": 4.2, "vitC": 3.6, "vitA": 5.0, "fiber": 6.2, "sugar": 3.3,
        "calcium": 73.0, "zinc": 1.6, "sodium": 585.0,
        "glyph": "🧆", "tone": "emerald", "tag": "Plant Protein",
    },
    "filet_mignon": {
        "display": "Filet Mignon", "kcal": 261, "protein": 28.2, "fat": 15.8, "carb": 0.0,
        "iron": 2.7, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 18.0, "zinc": 4.6, "sodium": 330.0,
        "glyph": "🥩", "tone": "sky", "tag": "Steak",
    },
    "fish_and_chips": {
        "display": "Fish and Chips", "kcal": 388, "protein": 18.6, "fat": 20.0, "carb": 35.0,
        "iron": 1.0, "vitC": 7.2, "vitA": 14.0, "fiber": 2.8, "sugar": 0.8,
        "calcium": 36.0, "zinc": 0.9, "sodium": 714.0,
        "glyph": "🐟", "tone": "amber", "tag": "British",
    },
    "foie_gras": {
        "display": "Foie Gras", "kcal": 462, "protein": 11.4, "fat": 43.8, "carb": 4.7,
        "iron": 5.5, "vitC": 0.0, "vitA": 1001.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 24.0, "zinc": 1.7, "sodium": 697.0,
        "glyph": "🍖", "tone": "sky", "tag": "French",
    },
    "french_fries": {
        "display": "French Fries", "kcal": 365, "protein": 4.1, "fat": 17.0, "carb": 48.0,
        "iron": 0.8, "vitC": 7.5, "vitA": 0.0, "fiber": 4.0, "sugar": 0.4,
        "calcium": 12.0, "zinc": 0.5, "sodium": 246.0,
        "glyph": "🍟", "tone": "amber", "tag": "Side",
    },
    "french_onion_soup": {
        "display": "French Onion Soup", "kcal": 172, "protein": 9.0, "fat": 7.5, "carb": 16.5,
        "iron": 0.8, "vitC": 4.0, "vitA": 18.0, "fiber": 1.2, "sugar": 6.5,
        "calcium": 204.0, "zinc": 0.9, "sodium": 900.0,
        "glyph": "🍲", "tone": "amber", "tag": "Soup",
    },
    "french_toast": {
        "display": "French Toast", "kcal": 282, "protein": 8.8, "fat": 12.5, "carb": 34.0,
        "iron": 2.0, "vitC": 0.0, "vitA": 95.0, "fiber": 1.1, "sugar": 11.0,
        "calcium": 88.0, "zinc": 0.8, "sodium": 336.0,
        "glyph": "🍞", "tone": "amber", "tag": "Breakfast",
    },
    "fried_calamari": {
        "display": "Fried Calamari", "kcal": 218, "protein": 14.8, "fat": 9.8, "carb": 17.5,
        "iron": 0.8, "vitC": 0.0, "vitA": 8.0, "fiber": 0.4, "sugar": 0.2,
        "calcium": 33.0, "zinc": 1.4, "sodium": 472.0,
        "glyph": "🦑", "tone": "sky", "tag": "Seafood",
    },
    "fried_rice": {
        "display": "Fried Rice", "kcal": 261, "protein": 6.6, "fat": 8.0, "carb": 40.5,
        "iron": 1.2, "vitC": 3.1, "vitA": 28.0, "fiber": 1.4, "sugar": 1.5,
        "calcium": 20.0, "zinc": 0.8, "sodium": 595.0,
        "glyph": "🍚", "tone": "amber", "tag": "Asian",
    },
    "frozen_yogurt": {
        "display": "Frozen Yogurt", "kcal": 159, "protein": 4.0, "fat": 3.6, "carb": 27.5,
        "iron": 0.1, "vitC": 0.6, "vitA": 20.0, "fiber": 0.0, "sugar": 24.0,
        "calcium": 130.0, "zinc": 0.5, "sodium": 68.0,
        "glyph": "🍦", "tone": "sky", "tag": "Dessert",
    },
    "garlic_bread": {
        "display": "Garlic Bread", "kcal": 345, "protein": 7.6, "fat": 15.5, "carb": 43.0,
        "iron": 2.0, "vitC": 0.6, "vitA": 42.0, "fiber": 2.0, "sugar": 1.8,
        "calcium": 58.0, "zinc": 0.8, "sodium": 567.0,
        "glyph": "🧄", "tone": "amber", "tag": "Bread",
    },
    "gnocchi": {
        "display": "Gnocchi", "kcal": 250, "protein": 6.5, "fat": 5.5, "carb": 44.5,
        "iron": 1.4, "vitC": 4.8, "vitA": 0.0, "fiber": 1.8, "sugar": 1.8,
        "calcium": 22.0, "zinc": 0.5, "sodium": 418.0,
        "glyph": "🍝", "tone": "amber", "tag": "Italian",
    },
    "greek_salad": {
        "display": "Greek Salad", "kcal": 179, "protein": 4.8, "fat": 14.0, "carb": 9.5,
        "iron": 0.9, "vitC": 27.0, "vitA": 44.0, "fiber": 2.8, "sugar": 5.5,
        "calcium": 148.0, "zinc": 0.7, "sodium": 756.0,
        "glyph": "🥗", "tone": "emerald", "tag": "Salad",
    },
    "grilled_cheese_sandwich": {
        "display": "Grilled Cheese", "kcal": 410, "protein": 16.2, "fat": 24.5, "carb": 31.5,
        "iron": 1.6, "vitC": 0.0, "vitA": 158.0, "fiber": 0.9, "sugar": 3.5,
        "calcium": 358.0, "zinc": 2.0, "sodium": 840.0,
        "glyph": "🧀", "tone": "amber", "tag": "Sandwich",
    },
    "grilled_salmon": {
        "display": "Grilled Salmon", "kcal": 292, "protein": 39.2, "fat": 13.4, "carb": 0.0,
        "iron": 1.2, "vitC": 0.0, "vitA": 17.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 26.0, "zinc": 1.3, "sodium": 98.0,
        "glyph": "🐟", "tone": "sky", "tag": "Omega-3",
    },
    "guacamole": {
        "display": "Guacamole", "kcal": 162, "protein": 2.0, "fat": 15.0, "carb": 8.5,
        "iron": 0.6, "vitC": 10.0, "vitA": 10.0, "fiber": 6.7, "sugar": 0.7,
        "calcium": 12.0, "zinc": 0.6, "sodium": 254.0,
        "glyph": "🥑", "tone": "emerald", "tag": "Healthy Fat",
    },
    "gyoza": {
        "display": "Gyoza", "kcal": 243, "protein": 11.5, "fat": 9.5, "carb": 27.5,
        "iron": 1.7, "vitC": 2.8, "vitA": 14.0, "fiber": 1.4, "sugar": 1.8,
        "calcium": 34.0, "zinc": 1.0, "sodium": 488.0,
        "glyph": "🥟", "tone": "amber", "tag": "Japanese",
    },
    "hamburger": {
        "display": "Hamburger", "kcal": 540, "protein": 31.0, "fat": 28.0, "carb": 41.0,
        "iron": 3.2, "vitC": 2.5, "vitA": 28.0, "fiber": 1.8, "sugar": 6.5,
        "calcium": 68.0, "zinc": 4.8, "sodium": 840.0,
        "glyph": "🍔", "tone": "amber", "tag": "Burger",
    },
    "hot_and_sour_soup": {
        "display": "Hot and Sour Soup", "kcal": 95, "protein": 6.0, "fat": 2.8, "carb": 11.5,
        "iron": 0.9, "vitC": 1.5, "vitA": 14.0, "fiber": 0.8, "sugar": 2.5,
        "calcium": 28.0, "zinc": 0.7, "sodium": 860.0,
        "glyph": "🍲", "tone": "sky", "tag": "Chinese Soup",
    },
    "hot_dog": {
        "display": "Hot Dog", "kcal": 290, "protein": 10.8, "fat": 17.0, "carb": 23.0,
        "iron": 1.2, "vitC": 0.0, "vitA": 0.0, "fiber": 0.9, "sugar": 4.8,
        "calcium": 48.0, "zinc": 1.5, "sodium": 680.0,
        "glyph": "🌭", "tone": "amber", "tag": "Street Food",
    },
    "huevos_rancheros": {
        "display": "Huevos Rancheros", "kcal": 318, "protein": 17.5, "fat": 18.0, "carb": 23.5,
        "iron": 3.0, "vitC": 12.0, "vitA": 116.0, "fiber": 3.8, "sugar": 2.8,
        "calcium": 102.0, "zinc": 2.0, "sodium": 638.0,
        "glyph": "🍳", "tone": "emerald", "tag": "Mexican Breakfast",
    },
    "hummus": {
        "display": "Hummus", "kcal": 177, "protein": 7.9, "fat": 9.6, "carb": 16.9,
        "iron": 2.9, "vitC": 3.3, "vitA": 4.0, "fiber": 6.0, "sugar": 2.1,
        "calcium": 49.0, "zinc": 1.4, "sodium": 428.0,
        "glyph": "🫙", "tone": "emerald", "tag": "Plant Protein",
    },
    "ice_cream": {
        "display": "Ice Cream", "kcal": 273, "protein": 4.6, "fat": 14.5, "carb": 32.0,
        "iron": 0.1, "vitC": 0.6, "vitA": 118.0, "fiber": 0.0, "sugar": 28.0,
        "calcium": 169.0, "zinc": 0.6, "sodium": 106.0,
        "glyph": "🍨", "tone": "sky", "tag": "Dessert",
    },
    "lasagna": {
        "display": "Lasagna", "kcal": 303, "protein": 17.5, "fat": 13.0, "carb": 28.5,
        "iron": 2.4, "vitC": 3.8, "vitA": 76.0, "fiber": 2.3, "sugar": 5.5,
        "calcium": 172.0, "zinc": 2.0, "sodium": 708.0,
        "glyph": "🍝", "tone": "amber", "tag": "Italian",
    },
    "lobster_bisque": {
        "display": "Lobster Bisque", "kcal": 206, "protein": 10.6, "fat": 11.5, "carb": 14.5,
        "iron": 0.8, "vitC": 2.5, "vitA": 76.0, "fiber": 0.4, "sugar": 4.2,
        "calcium": 116.0, "zinc": 1.4, "sodium": 794.0,
        "glyph": "🦞", "tone": "sky", "tag": "Seafood Soup",
    },
    "lobster_roll_sandwich": {
        "display": "Lobster Roll", "kcal": 346, "protein": 22.0, "fat": 13.5, "carb": 34.5,
        "iron": 0.8, "vitC": 1.5, "vitA": 13.0, "fiber": 1.4, "sugar": 4.5,
        "calcium": 68.0, "zinc": 2.4, "sodium": 734.0,
        "glyph": "🦞", "tone": "sky", "tag": "Seafood",
    },
    "macaroni_and_cheese": {
        "display": "Mac & Cheese", "kcal": 371, "protein": 14.5, "fat": 14.5, "carb": 46.0,
        "iron": 1.6, "vitC": 0.5, "vitA": 82.0, "fiber": 1.4, "sugar": 5.5,
        "calcium": 228.0, "zinc": 1.6, "sodium": 792.0,
        "glyph": "🧀", "tone": "amber", "tag": "Comfort Food",
    },
    "macarons": {
        "display": "Macarons", "kcal": 390, "protein": 5.5, "fat": 15.0, "carb": 60.0,
        "iron": 0.5, "vitC": 0.0, "vitA": 4.0, "fiber": 0.9, "sugar": 52.0,
        "calcium": 32.0, "zinc": 0.3, "sodium": 62.0,
        "glyph": "🍬", "tone": "amber", "tag": "French Pastry",
    },
    "miso_soup": {
        "display": "Miso Soup", "kcal": 40, "protein": 2.9, "fat": 1.3, "carb": 4.2,
        "iron": 0.7, "vitC": 0.0, "vitA": 4.0, "fiber": 0.5, "sugar": 1.0,
        "calcium": 22.0, "zinc": 0.4, "sodium": 631.0,
        "glyph": "🍜", "tone": "sky", "tag": "Japanese Soup",
    },
    "mussels": {
        "display": "Mussels", "kcal": 172, "protein": 23.8, "fat": 4.5, "carb": 7.4,
        "iron": 6.7, "vitC": 8.0, "vitA": 48.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 33.0, "zinc": 2.7, "sodium": 369.0,
        "glyph": "🦪", "tone": "sky", "tag": "High Iron Seafood",
    },
    "nachos": {
        "display": "Nachos", "kcal": 493, "protein": 17.5, "fat": 27.0, "carb": 48.0,
        "iron": 2.1, "vitC": 2.8, "vitA": 80.0, "fiber": 3.8, "sugar": 2.5,
        "calcium": 286.0, "zinc": 2.1, "sodium": 962.0,
        "glyph": "🧀", "tone": "amber", "tag": "Mexican",
    },
    "omelette": {
        "display": "Omelette", "kcal": 217, "protein": 14.9, "fat": 16.8, "carb": 1.8,
        "iron": 1.9, "vitC": 0.4, "vitA": 136.0, "fiber": 0.0, "sugar": 0.9,
        "calcium": 68.0, "zinc": 1.3, "sodium": 346.0,
        "glyph": "🍳", "tone": "sky", "tag": "Egg Dish",
    },
    "onion_rings": {
        "display": "Onion Rings", "kcal": 411, "protein": 5.0, "fat": 26.0, "carb": 40.5,
        "iron": 1.0, "vitC": 3.0, "vitA": 0.0, "fiber": 2.0, "sugar": 2.5,
        "calcium": 30.0, "zinc": 0.5, "sodium": 558.0,
        "glyph": "🧅", "tone": "amber", "tag": "Side",
    },
    "oysters": {
        "display": "Oysters", "kcal": 117, "protein": 12.1, "fat": 4.2, "carb": 6.7,
        "iron": 7.8, "vitC": 5.1, "vitA": 66.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 62.0, "zinc": 32.2, "sodium": 359.0,
        "glyph": "🦪", "tone": "sky", "tag": "High Zinc Seafood",
    },
    "pad_thai": {
        "display": "Pad Thai", "kcal": 408, "protein": 18.5, "fat": 16.5, "carb": 47.0,
        "iron": 2.1, "vitC": 5.0, "vitA": 30.0, "fiber": 2.4, "sugar": 8.5,
        "calcium": 62.0, "zinc": 1.6, "sodium": 784.0,
        "glyph": "🍜", "tone": "amber", "tag": "Thai",
    },
    "paella": {
        "display": "Paella", "kcal": 369, "protein": 24.5, "fat": 11.5, "carb": 42.0,
        "iron": 3.1, "vitC": 7.8, "vitA": 28.0, "fiber": 2.4, "sugar": 1.8,
        "calcium": 58.0, "zinc": 2.4, "sodium": 680.0,
        "glyph": "🥘", "tone": "amber", "tag": "Spanish",
    },
    "pancakes": {
        "display": "Pancakes", "kcal": 330, "protein": 8.1, "fat": 9.0, "carb": 54.0,
        "iron": 2.1, "vitC": 0.0, "vitA": 52.0, "fiber": 1.5, "sugar": 13.5,
        "calcium": 108.0, "zinc": 0.8, "sodium": 524.0,
        "glyph": "🥞", "tone": "amber", "tag": "Breakfast",
    },
    "panna_cotta": {
        "display": "Panna Cotta", "kcal": 234, "protein": 3.8, "fat": 15.5, "carb": 21.5,
        "iron": 0.1, "vitC": 0.0, "vitA": 98.0, "fiber": 0.0, "sugar": 20.0,
        "calcium": 112.0, "zinc": 0.4, "sodium": 58.0,
        "glyph": "🍮", "tone": "sky", "tag": "Italian Dessert",
    },
    "peking_duck": {
        "display": "Peking Duck", "kcal": 370, "protein": 27.5, "fat": 28.0, "carb": 4.0,
        "iron": 2.4, "vitC": 0.0, "vitA": 48.0, "fiber": 0.0, "sugar": 1.5,
        "calcium": 14.0, "zinc": 2.8, "sodium": 640.0,
        "glyph": "🦆", "tone": "amber", "tag": "Chinese",
    },
    "pho": {
        "display": "Pho", "kcal": 340, "protein": 24.5, "fat": 6.0, "carb": 44.0,
        "iron": 2.9, "vitC": 5.5, "vitA": 10.0, "fiber": 1.9, "sugar": 3.8,
        "calcium": 28.0, "zinc": 2.4, "sodium": 860.0,
        "glyph": "🍜", "tone": "sky", "tag": "Vietnamese Noodle",
    },
    "pizza": {
        "display": "Pizza", "kcal": 285, "protein": 12.4, "fat": 10.4, "carb": 35.5,
        "iron": 2.1, "vitC": 2.4, "vitA": 68.0, "fiber": 2.3, "sugar": 3.6,
        "calcium": 201.0, "zinc": 1.5, "sodium": 640.0,
        "glyph": "🍕", "tone": "amber", "tag": "Italian",
    },
    "cheese_pizza": {
        "display": "Cheese Pizza", "kcal": 300, "protein": 13.0, "fat": 12.5, "carb": 34.0,
        "iron": 2.0, "vitC": 1.8, "vitA": 82.0, "fiber": 2.0, "sugar": 3.8,
        "calcium": 240.0, "zinc": 1.8, "sodium": 700.0,
        "glyph": "🍕", "tone": "amber", "tag": "Italian",
    },
    "pork_chop": {
        "display": "Pork Chop", "kcal": 243, "protein": 27.4, "fat": 14.0, "carb": 0.0,
        "iron": 0.9, "vitC": 0.0, "vitA": 4.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 18.0, "zinc": 2.6, "sodium": 469.0,
        "glyph": "🍖", "tone": "amber", "tag": "Pork",
    },
    "poutine": {
        "display": "Poutine", "kcal": 475, "protein": 14.0, "fat": 25.0, "carb": 50.0,
        "iron": 1.9, "vitC": 6.5, "vitA": 9.0, "fiber": 3.2, "sugar": 2.5,
        "calcium": 186.0, "zinc": 1.4, "sodium": 990.0,
        "glyph": "🍟", "tone": "amber", "tag": "Canadian",
    },
    "prime_rib": {
        "display": "Prime Rib", "kcal": 360, "protein": 29.5, "fat": 27.0, "carb": 0.0,
        "iron": 2.6, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 19.0, "zinc": 5.8, "sodium": 370.0,
        "glyph": "🥩", "tone": "sky", "tag": "Beef",
    },
    "pulled_pork_sandwich": {
        "display": "Pulled Pork Sandwich", "kcal": 480, "protein": 27.5, "fat": 18.0, "carb": 48.0,
        "iron": 2.4, "vitC": 2.5, "vitA": 8.0, "fiber": 2.3, "sugar": 12.0,
        "calcium": 58.0, "zinc": 2.9, "sodium": 892.0,
        "glyph": "🥪", "tone": "amber", "tag": "BBQ",
    },
    "ramen": {
        "display": "Ramen", "kcal": 430, "protein": 19.5, "fat": 16.0, "carb": 52.0,
        "iron": 2.5, "vitC": 2.8, "vitA": 18.0, "fiber": 2.0, "sugar": 4.5,
        "calcium": 38.0, "zinc": 1.9, "sodium": 1200.0,
        "glyph": "🍜", "tone": "amber", "tag": "Japanese Noodle",
    },
    "ravioli": {
        "display": "Ravioli", "kcal": 304, "protein": 14.0, "fat": 11.0, "carb": 38.5,
        "iron": 1.8, "vitC": 1.8, "vitA": 48.0, "fiber": 1.9, "sugar": 3.8,
        "calcium": 124.0, "zinc": 1.2, "sodium": 518.0,
        "glyph": "🍝", "tone": "amber", "tag": "Italian Pasta",
    },
    "red_velvet_cake": {
        "display": "Red Velvet Cake", "kcal": 427, "protein": 4.8, "fat": 21.5, "carb": 56.0,
        "iron": 1.5, "vitC": 0.0, "vitA": 28.0, "fiber": 0.5, "sugar": 40.0,
        "calcium": 58.0, "zinc": 0.4, "sodium": 388.0,
        "glyph": "🎂", "tone": "amber", "tag": "Dessert",
    },
    "risotto": {
        "display": "Risotto", "kcal": 306, "protein": 9.0, "fat": 9.5, "carb": 46.0,
        "iron": 1.4, "vitC": 1.8, "vitA": 28.0, "fiber": 1.4, "sugar": 1.8,
        "calcium": 98.0, "zinc": 1.0, "sodium": 536.0,
        "glyph": "🍚", "tone": "amber", "tag": "Italian Rice",
    },
    "samosa": {
        "display": "Samosa", "kcal": 262, "protein": 5.2, "fat": 13.5, "carb": 31.0,
        "iron": 1.6, "vitC": 8.5, "vitA": 9.0, "fiber": 2.8, "sugar": 1.8,
        "calcium": 26.0, "zinc": 0.6, "sodium": 448.0,
        "glyph": "🥟", "tone": "amber", "tag": "Indian",
    },
    "sashimi": {
        "display": "Sashimi", "kcal": 130, "protein": 22.0, "fat": 4.0, "carb": 0.0,
        "iron": 1.0, "vitC": 0.0, "vitA": 30.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 9.0, "zinc": 0.7, "sodium": 46.0,
        "glyph": "🐟", "tone": "sky", "tag": "Japanese Raw Fish",
    },
    "scallops": {
        "display": "Scallops", "kcal": 111, "protein": 20.5, "fat": 0.8, "carb": 5.4,
        "iron": 0.4, "vitC": 0.0, "vitA": 9.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 10.0, "zinc": 1.1, "sodium": 386.0,
        "glyph": "🐚", "tone": "sky", "tag": "Seafood",
    },
    "seaweed_salad": {
        "display": "Seaweed Salad", "kcal": 68, "protein": 1.5, "fat": 3.8, "carb": 7.8,
        "iron": 1.8, "vitC": 1.8, "vitA": 78.0, "fiber": 1.9, "sugar": 1.8,
        "calcium": 58.0, "zinc": 0.4, "sodium": 418.0,
        "glyph": "🥗", "tone": "emerald", "tag": "Japanese",
    },
    "shrimp_and_grits": {
        "display": "Shrimp and Grits", "kcal": 372, "protein": 23.5, "fat": 13.5, "carb": 38.5,
        "iron": 1.9, "vitC": 1.8, "vitA": 58.0, "fiber": 1.4, "sugar": 1.8,
        "calcium": 78.0, "zinc": 1.4, "sodium": 784.0,
        "glyph": "🍤", "tone": "sky", "tag": "Southern US",
    },
    "spaghetti_bolognese": {
        "display": "Spaghetti Bolognese", "kcal": 400, "protein": 21.5, "fat": 13.5, "carb": 47.0,
        "iron": 3.1, "vitC": 5.0, "vitA": 48.0, "fiber": 3.0, "sugar": 4.8,
        "calcium": 58.0, "zinc": 3.0, "sodium": 574.0,
        "glyph": "🍝", "tone": "amber", "tag": "Italian Pasta",
    },
    "spaghetti_carbonara": {
        "display": "Spaghetti Carbonara", "kcal": 455, "protein": 17.5, "fat": 20.5, "carb": 51.0,
        "iron": 1.6, "vitC": 0.0, "vitA": 68.0, "fiber": 2.0, "sugar": 1.8,
        "calcium": 78.0, "zinc": 1.5, "sodium": 618.0,
        "glyph": "🍝", "tone": "amber", "tag": "Italian Pasta",
    },
    "spring_rolls": {
        "display": "Spring Rolls", "kcal": 225, "protein": 6.0, "fat": 10.5, "carb": 27.5,
        "iron": 1.1, "vitC": 4.8, "vitA": 28.0, "fiber": 1.9, "sugar": 2.8,
        "calcium": 28.0, "zinc": 0.6, "sodium": 414.0,
        "glyph": "🥟", "tone": "amber", "tag": "Asian",
    },
    "steak": {
        "display": "Steak", "kcal": 271, "protein": 25.8, "fat": 18.0, "carb": 0.0,
        "iron": 2.5, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 18.0, "zinc": 4.8, "sodium": 356.0,
        "glyph": "🥩", "tone": "sky", "tag": "Beef",
    },
    "strawberry_shortcake": {
        "display": "Strawberry Shortcake", "kcal": 335, "protein": 4.8, "fat": 14.0, "carb": 48.0,
        "iron": 0.9, "vitC": 34.0, "vitA": 38.0, "fiber": 1.9, "sugar": 24.0,
        "calcium": 78.0, "zinc": 0.4, "sodium": 218.0,
        "glyph": "🍓", "tone": "amber", "tag": "Dessert",
    },
    "sushi": {
        "display": "Sushi", "kcal": 200, "protein": 9.8, "fat": 2.0, "carb": 38.0,
        "iron": 0.7, "vitC": 0.8, "vitA": 18.0, "fiber": 1.4, "sugar": 3.8,
        "calcium": 18.0, "zinc": 0.8, "sodium": 488.0,
        "glyph": "🍣", "tone": "sky", "tag": "Japanese",
    },
    "tacos": {
        "display": "Tacos", "kcal": 353, "protein": 18.0, "fat": 16.5, "carb": 32.0,
        "iron": 2.6, "vitC": 8.5, "vitA": 38.0, "fiber": 3.4, "sugar": 2.8,
        "calcium": 102.0, "zinc": 2.5, "sodium": 682.0,
        "glyph": "🌮", "tone": "amber", "tag": "Mexican",
    },
    "takoyaki": {
        "display": "Takoyaki", "kcal": 208, "protein": 9.4, "fat": 8.5, "carb": 24.5,
        "iron": 1.0, "vitC": 1.0, "vitA": 9.0, "fiber": 0.5, "sugar": 3.0,
        "calcium": 38.0, "zinc": 0.7, "sodium": 486.0,
        "glyph": "🐙", "tone": "amber", "tag": "Japanese Street Food",
    },
    "tiramisu": {
        "display": "Tiramisu", "kcal": 283, "protein": 5.9, "fat": 15.0, "carb": 32.0,
        "iron": 0.7, "vitC": 0.0, "vitA": 78.0, "fiber": 0.5, "sugar": 22.0,
        "calcium": 68.0, "zinc": 0.5, "sodium": 68.0,
        "glyph": "🍰", "tone": "amber", "tag": "Italian Dessert",
    },
    "tuna_tartare": {
        "display": "Tuna Tartare", "kcal": 154, "protein": 24.4, "fat": 5.0, "carb": 3.5,
        "iron": 1.3, "vitC": 4.8, "vitA": 22.0, "fiber": 0.5, "sugar": 0.8,
        "calcium": 18.0, "zinc": 0.9, "sodium": 316.0,
        "glyph": "🐟", "tone": "sky", "tag": "Raw Seafood",
    },
    "waffles": {
        "display": "Waffles", "kcal": 310, "protein": 7.9, "fat": 10.6, "carb": 46.0,
        "iron": 2.1, "vitC": 0.0, "vitA": 44.0, "fiber": 1.4, "sugar": 8.0,
        "calcium": 104.0, "zinc": 0.8, "sodium": 454.0,
        "glyph": "🧇", "tone": "amber", "tag": "Breakfast",
    },

    # ── Rwandan staple foods (FAO/INFOODS East African Food Composition Table 2012) ──
    "ugali": {
        "display": "Ugali", "kcal": 194, "protein": 4.4, "fat": 0.8, "carb": 43.0,
        "iron": 0.6, "vitC": 0.0, "vitA": 0.0, "fiber": 2.4, "sugar": 0.0,
        "calcium": 10.0, "zinc": 0.8, "sodium": 4.0,
        "glyph": "🫕", "tone": "amber", "tag": "Staple Grain",
    },
    "isombe": {
        "display": "Isombe", "kcal": 145, "protein": 7.0, "fat": 8.5, "carb": 12.0,
        "iron": 3.2, "vitC": 22.0, "vitA": 420.0, "fiber": 4.8, "sugar": 1.5,
        "calcium": 180.0, "zinc": 0.9, "sodium": 15.0,
        "glyph": "🌿", "tone": "emerald", "tag": "Iron-Rich Greens",
    },
    "matoke": {
        "display": "Matoke", "kcal": 134, "protein": 2.0, "fat": 0.6, "carb": 34.2,
        "iron": 0.9, "vitC": 21.0, "vitA": 27.0, "fiber": 3.9, "sugar": 18.0,
        "calcium": 5.0, "zinc": 0.3, "sodium": 5.0,
        "glyph": "🍌", "tone": "amber", "tag": "Plantain",
    },
    "ibirayi": {
        "display": "Ibirayi", "kcal": 129, "protein": 2.4, "fat": 0.2, "carb": 30.2,
        "iron": 0.9, "vitC": 29.0, "vitA": 1441.0, "fiber": 4.5, "sugar": 6.3,
        "calcium": 45.0, "zinc": 0.5, "sodium": 83.0,
        "glyph": "🍠", "tone": "emerald", "tag": "Vitamin A",
    },
    "ibishyimbo": {
        "display": "Ibishyimbo", "kcal": 191, "protein": 13.1, "fat": 0.8, "carb": 34.2,
        "iron": 4.4, "vitC": 1.8, "vitA": 0.0, "fiber": 9.6, "sugar": 0.5,
        "calcium": 42.0, "zinc": 1.7, "sodium": 3.0,
        "glyph": "🫘", "tone": "emerald", "tag": "High Iron",
    },
    "umutsima": {
        "display": "Umutsima", "kcal": 170, "protein": 3.6, "fat": 0.6, "carb": 39.0,
        "iron": 1.6, "vitC": 0.0, "vitA": 0.0, "fiber": 3.0, "sugar": 0.0,
        "calcium": 30.0, "zinc": 1.0, "sodium": 6.0,
        "glyph": "🫕", "tone": "amber", "tag": "Staple Porridge",
    },
    "ikivuguto": {
        "display": "Ikivuguto", "kcal": 130, "protein": 9.0, "fat": 8.0, "carb": 7.0,
        "iron": 0.3, "vitC": 2.5, "vitA": 75.0, "fiber": 0.0, "sugar": 7.0,
        "calcium": 313.0, "zinc": 1.0, "sodium": 115.0,
        "glyph": "🥛", "tone": "sky", "tag": "Calcium-Rich",
    },
    "inshyushyu": {
        "display": "Inshyushyu", "kcal": 156, "protein": 4.4, "fat": 1.2, "carb": 35.0,
        "iron": 2.4, "vitC": 0.0, "vitA": 0.0, "fiber": 3.6, "sugar": 0.0,
        "calcium": 24.0, "zinc": 1.4, "sodium": 4.0,
        "glyph": "🌾", "tone": "amber", "tag": "High Iron",
    },
    "brochettes": {
        "display": "Brochettes", "kcal": 165, "protein": 21.0, "fat": 8.5, "carb": 0.0,
        "iron": 2.5, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 15.0, "zinc": 4.0, "sodium": 85.0,
        "glyph": "🍢", "tone": "sky", "tag": "Lean Protein",
    },
    "amashaza": {
        "display": "Amashaza", "kcal": 177, "protein": 12.5, "fat": 0.6, "carb": 31.7,
        "iron": 2.7, "vitC": 0.8, "vitA": 3.0, "fiber": 8.3, "sugar": 0.8,
        "calcium": 33.0, "zinc": 1.5, "sodium": 5.0,
        "glyph": "🫛", "tone": "emerald", "tag": "High Iron",
    },
    "sambaza": {
        "display": "Sambaza", "kcal": 148, "protein": 17.6, "fat": 8.0, "carb": 0.0,
        "iron": 1.4, "vitC": 0.0, "vitA": 12.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 320.0, "zinc": 1.2, "sodium": 96.0,
        "glyph": "🐟", "tone": "sky", "tag": "Calcium-Rich",
    },
    "tilapia": {
        "display": "Tilapia", "kcal": 154, "protein": 31.4, "fat": 3.2, "carb": 0.0,
        "iron": 0.8, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 12.0, "zinc": 0.5, "sodium": 62.0,
        "glyph": "🐠", "tone": "sky", "tag": "Lean Protein",
    },
    "avocado": {
        "display": "Avocado", "kcal": 160, "protein": 2.0, "fat": 14.7, "carb": 8.5,
        "iron": 0.6, "vitC": 10.0, "vitA": 7.0, "fiber": 6.7, "sugar": 0.7,
        "calcium": 12.0, "zinc": 0.6, "sodium": 7.0,
        "glyph": "🥑", "tone": "emerald", "tag": "Healthy Fats",
    },
    "mandazi": {
        "display": "Mandazi", "kcal": 181, "protein": 3.3, "fat": 6.9, "carb": 26.7,
        "iron": 1.1, "vitC": 0.0, "vitA": 0.0, "fiber": 0.9, "sugar": 4.8,
        "calcium": 27.0, "zinc": 0.3, "sodium": 168.0,
        "glyph": "🫓", "tone": "amber", "tag": "Fried Dough",
    },
    "cassava": {
        "display": "Cassava", "kcal": 240, "protein": 2.1, "fat": 0.5, "carb": 57.2,
        "iron": 0.5, "vitC": 30.0, "vitA": 2.0, "fiber": 2.7, "sugar": 2.6,
        "calcium": 24.0, "zinc": 0.5, "sodium": 21.0,
        "glyph": "🌽", "tone": "amber", "tag": "Starchy Staple",
    },
    "doodo": {
        "display": "Doodo", "kcal": 23, "protein": 2.5, "fat": 0.3, "carb": 4.0,
        "iron": 2.3, "vitC": 43.0, "vitA": 292.0, "fiber": 2.2, "sugar": 0.0,
        "calcium": 215.0, "zinc": 0.9, "sodium": 20.0,
        "glyph": "🥬", "tone": "emerald", "tag": "Iron-Rich Greens",
    },
    "groundnuts": {
        "display": "Groundnuts", "kcal": 170, "protein": 7.7, "fat": 14.8, "carb": 4.8,
        "iron": 1.4, "vitC": 0.0, "vitA": 0.0, "fiber": 2.6, "sugar": 1.4,
        "calcium": 28.0, "zinc": 1.0, "sodium": 2.0,
        "glyph": "🥜", "tone": "amber", "tag": "Plant Protein",
    },
    "sorghum_ugali": {
        "display": "Sorghum Ugali", "kcal": 166, "protein": 5.6, "fat": 1.8, "carb": 35.0,
        "iron": 3.6, "vitC": 0.0, "vitA": 0.0, "fiber": 3.0, "sugar": 0.0,
        "calcium": 50.0, "zinc": 1.6, "sodium": 4.0,
        "glyph": "🫕", "tone": "emerald", "tag": "High Iron Grain",
    },
    "agatogo": {
        "display": "Agatogo", "kcal": 210, "protein": 10.4, "fat": 5.6, "carb": 31.0,
        "iron": 2.0, "vitC": 16.0, "vitA": 24.0, "fiber": 4.4, "sugar": 12.0,
        "calcium": 30.0, "zinc": 1.6, "sodium": 70.0,
        "glyph": "🍲", "tone": "emerald", "tag": "Balanced Meal",
    },
    "sweet_potato_leaves": {
        "display": "Sweet Potato Leaves", "kcal": 43, "protein": 4.8, "fat": 0.5, "carb": 7.2,
        "iron": 2.6, "vitC": 35.0, "vitA": 318.0, "fiber": 3.8, "sugar": 0.0,
        "calcium": 130.0, "zinc": 0.7, "sodium": 25.0,
        "glyph": "🌿", "tone": "emerald", "tag": "Iron-Rich Greens",
    },

    # ── KenyanFood13 classifier classes (FAO/Kenya NFCT KEBS 2018) ──────────────
    "bhaji": {
        "display": "Bhaji", "kcal": 200, "protein": 4.5, "fat": 12.0, "carb": 20.0,
        "iron": 1.5, "vitC": 8.0, "vitA": 50.0, "fiber": 2.5, "sugar": 3.0,
        "calcium": 60.0, "zinc": 0.8, "sodium": 350.0,
        "glyph": "🧅", "tone": "amber", "tag": "Fried Snack",
    },
    "chapati": {
        "display": "Chapati", "kcal": 310, "protein": 8.5, "fat": 9.0, "carb": 48.0,
        "iron": 2.1, "vitC": 0.0, "vitA": 0.0, "fiber": 2.2, "sugar": 1.5,
        "calcium": 25.0, "zinc": 0.9, "sodium": 220.0,
        "glyph": "🫓", "tone": "amber", "tag": "Flatbread",
    },
    "githeri": {
        "display": "Githeri", "kcal": 213, "protein": 10.8, "fat": 1.5, "carb": 40.5,
        "iron": 3.1, "vitC": 4.0, "vitA": 12.0, "fiber": 8.2, "sugar": 2.0,
        "calcium": 52.0, "zinc": 1.8, "sodium": 18.0,
        "glyph": "🫘", "tone": "emerald", "tag": "High Iron",
    },
    "kachumbari": {
        "display": "Kachumbari", "kcal": 35, "protein": 1.2, "fat": 0.3, "carb": 8.0,
        "iron": 0.8, "vitC": 28.0, "vitA": 62.0, "fiber": 2.0, "sugar": 5.0,
        "calcium": 25.0, "zinc": 0.2, "sodium": 12.0,
        "glyph": "🍅", "tone": "emerald", "tag": "Vitamin C Rich",
    },
    "kukuchoma": {
        "display": "Kuku Choma", "kcal": 215, "protein": 28.0, "fat": 11.0, "carb": 0.0,
        "iron": 1.3, "vitC": 0.0, "vitA": 45.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 18.0, "zinc": 2.2, "sodium": 95.0,
        "glyph": "🍗", "tone": "sky", "tag": "Lean Protein",
    },
    "masalachips": {
        "display": "Masala Chips", "kcal": 350, "protein": 4.5, "fat": 16.0, "carb": 47.0,
        "iron": 1.2, "vitC": 18.0, "vitA": 0.0, "fiber": 3.5, "sugar": 2.5,
        "calcium": 12.0, "zinc": 0.5, "sodium": 520.0,
        "glyph": "🍟", "tone": "amber", "tag": "Street Food",
    },
    "mukimo": {
        "display": "Mukimo", "kcal": 175, "protein": 4.8, "fat": 3.0, "carb": 33.0,
        "iron": 2.2, "vitC": 16.0, "vitA": 85.0, "fiber": 4.5, "sugar": 3.0,
        "calcium": 42.0, "zinc": 0.7, "sodium": 28.0,
        "glyph": "🥔", "tone": "emerald", "tag": "Iron & Vitamin A",
    },
    "nyamachoma": {
        "display": "Nyama Choma", "kcal": 242, "protein": 30.0, "fat": 13.0, "carb": 0.0,
        "iron": 2.8, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 20.0, "zinc": 5.0, "sodium": 85.0,
        "glyph": "🍖", "tone": "sky", "tag": "High Protein",
    },
    "pilau": {
        "display": "Pilau", "kcal": 285, "protein": 12.5, "fat": 9.0, "carb": 38.0,
        "iron": 2.0, "vitC": 2.0, "vitA": 25.0, "fiber": 1.5, "sugar": 2.0,
        "calcium": 30.0, "zinc": 1.8, "sodium": 380.0,
        "glyph": "🍛", "tone": "amber", "tag": "Spiced Rice",
    },
    "sukumawiki": {
        "display": "Sukuma Wiki", "kcal": 55, "protein": 3.5, "fat": 2.8, "carb": 6.5,
        "iron": 2.9, "vitC": 62.0, "vitA": 380.0, "fiber": 3.2, "sugar": 1.5,
        "calcium": 165.0, "zinc": 0.6, "sodium": 25.0,
        "glyph": "🥬", "tone": "emerald", "tag": "Iron-Rich Greens",
    },
}

_FALLBACK: FoodMeta = {
    "display": "Unknown Food", "kcal": 250, "protein": 10.0, "fat": 10.0, "carb": 30.0,
    "iron": 1.0, "vitC": 2.0, "vitA": 20.0, "fiber": 2.0, "sugar": 5.0,
    "calcium": 50.0, "zinc": 1.0, "sodium": 400.0,
    "glyph": "🍽️", "tone": "amber", "tag": "Food",
}


def get(class_name: str) -> FoodMeta:
    if class_name in NUTRITION_DB:
        return NUTRITION_DB[class_name]
    # Display names like "Sukuma Wiki" become "sukuma_wiki" after normalisation;
    # strip underscores to also match compact keys like "sukumawiki", "kukuchoma".
    no_underscore = class_name.replace("_", "")
    return NUTRITION_DB.get(no_underscore, _FALLBACK)
