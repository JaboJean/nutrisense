"""
Nutrition data + UI metadata for all 101 Food-101 classes.

Values are per typical restaurant/home serving.
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
    "apple_pie": {
        "display": "Apple Pie", "kcal": 237, "protein": 2.4, "fat": 11.0, "carb": 34.0,
        "iron": 0.5, "vitC": 1.5, "vitA": 17.0, "fiber": 1.5, "sugar": 16.0,
        "calcium": 9.0, "zinc": 0.2, "sodium": 170.0,
        "glyph": "🥧", "tone": "amber", "tag": "Dessert",
    },
    "baby_back_ribs": {
        "display": "Baby Back Ribs", "kcal": 292, "protein": 24.0, "fat": 20.0, "carb": 5.0,
        "iron": 1.5, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 3.0,
        "calcium": 25.0, "zinc": 3.8, "sodium": 480.0,
        "glyph": "🍖", "tone": "amber", "tag": "BBQ",
    },
    "baklava": {
        "display": "Baklava", "kcal": 428, "protein": 6.5, "fat": 24.0, "carb": 50.0,
        "iron": 1.8, "vitC": 0.0, "vitA": 12.0, "fiber": 2.0, "sugar": 30.0,
        "calcium": 45.0, "zinc": 1.0, "sodium": 130.0,
        "glyph": "🍯", "tone": "amber", "tag": "Pastry",
    },
    "beef_carpaccio": {
        "display": "Beef Carpaccio", "kcal": 150, "protein": 20.0, "fat": 7.0, "carb": 1.0,
        "iron": 2.8, "vitC": 3.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 12.0, "zinc": 4.5, "sodium": 280.0,
        "glyph": "🥩", "tone": "sky", "tag": "Raw Beef",
    },
    "beef_tartare": {
        "display": "Beef Tartare", "kcal": 185, "protein": 21.0, "fat": 10.0, "carb": 2.0,
        "iron": 3.0, "vitC": 2.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.5,
        "calcium": 15.0, "zinc": 4.8, "sodium": 320.0,
        "glyph": "🥩", "tone": "sky", "tag": "Raw Beef",
    },
    "beet_salad": {
        "display": "Beet Salad", "kcal": 120, "protein": 3.5, "fat": 6.0, "carb": 14.0,
        "iron": 1.1, "vitC": 8.0, "vitA": 2.0, "fiber": 3.5, "sugar": 9.0,
        "calcium": 40.0, "zinc": 0.5, "sodium": 220.0,
        "glyph": "🥗", "tone": "emerald", "tag": "Salad",
    },
    "beignets": {
        "display": "Beignets", "kcal": 380, "protein": 5.0, "fat": 20.0, "carb": 46.0,
        "iron": 1.2, "vitC": 0.0, "vitA": 0.0, "fiber": 1.0, "sugar": 15.0,
        "calcium": 40.0, "zinc": 0.5, "sodium": 240.0,
        "glyph": "🍩", "tone": "amber", "tag": "Fried Dough",
    },
    "bibimbap": {
        "display": "Bibimbap", "kcal": 490, "protein": 22.0, "fat": 15.0, "carb": 65.0,
        "iron": 3.5, "vitC": 12.0, "vitA": 80.0, "fiber": 4.0, "sugar": 6.0,
        "calcium": 60.0, "zinc": 2.5, "sodium": 870.0,
        "glyph": "🍚", "tone": "emerald", "tag": "Korean Bowl",
    },
    "bread_pudding": {
        "display": "Bread Pudding", "kcal": 300, "protein": 8.0, "fat": 10.0, "carb": 44.0,
        "iron": 1.5, "vitC": 0.5, "vitA": 80.0, "fiber": 1.0, "sugar": 22.0,
        "calcium": 120.0, "zinc": 0.8, "sodium": 280.0,
        "glyph": "🍞", "tone": "amber", "tag": "Dessert",
    },
    "breakfast_burrito": {
        "display": "Breakfast Burrito", "kcal": 380, "protein": 18.0, "fat": 16.0, "carb": 40.0,
        "iron": 2.5, "vitC": 5.0, "vitA": 90.0, "fiber": 3.0, "sugar": 3.0,
        "calcium": 150.0, "zinc": 2.2, "sodium": 780.0,
        "glyph": "🌯", "tone": "amber", "tag": "Breakfast",
    },
    "bruschetta": {
        "display": "Bruschetta", "kcal": 180, "protein": 5.0, "fat": 7.0, "carb": 25.0,
        "iron": 1.0, "vitC": 10.0, "vitA": 40.0, "fiber": 2.0, "sugar": 4.0,
        "calcium": 50.0, "zinc": 0.6, "sodium": 320.0,
        "glyph": "🍅", "tone": "emerald", "tag": "Appetizer",
    },
    "caesar_salad": {
        "display": "Caesar Salad", "kcal": 180, "protein": 8.0, "fat": 14.0, "carb": 8.0,
        "iron": 1.8, "vitC": 15.0, "vitA": 140.0, "fiber": 2.5, "sugar": 2.0,
        "calcium": 120.0, "zinc": 0.9, "sodium": 560.0,
        "glyph": "🥗", "tone": "emerald", "tag": "Salad",
    },
    "cannoli": {
        "display": "Cannoli", "kcal": 327, "protein": 8.0, "fat": 18.0, "carb": 36.0,
        "iron": 0.8, "vitC": 0.0, "vitA": 40.0, "fiber": 0.5, "sugar": 22.0,
        "calcium": 80.0, "zinc": 0.6, "sodium": 140.0,
        "glyph": "🍮", "tone": "amber", "tag": "Italian Dessert",
    },
    "caprese_salad": {
        "display": "Caprese Salad", "kcal": 200, "protein": 12.0, "fat": 15.0, "carb": 5.0,
        "iron": 0.5, "vitC": 18.0, "vitA": 50.0, "fiber": 1.0, "sugar": 3.0,
        "calcium": 300.0, "zinc": 1.0, "sodium": 380.0,
        "glyph": "🍅", "tone": "emerald", "tag": "Salad",
    },
    "carrot_cake": {
        "display": "Carrot Cake", "kcal": 415, "protein": 4.5, "fat": 21.0, "carb": 54.0,
        "iron": 1.0, "vitC": 2.0, "vitA": 120.0, "fiber": 1.5, "sugar": 38.0,
        "calcium": 60.0, "zinc": 0.5, "sodium": 340.0,
        "glyph": "🎂", "tone": "amber", "tag": "Dessert",
    },
    "ceviche": {
        "display": "Ceviche", "kcal": 130, "protein": 20.0, "fat": 2.0, "carb": 8.0,
        "iron": 1.2, "vitC": 25.0, "vitA": 15.0, "fiber": 1.5, "sugar": 3.0,
        "calcium": 35.0, "zinc": 1.8, "sodium": 480.0,
        "glyph": "🐟", "tone": "sky", "tag": "Seafood",
    },
    "cheese_plate": {
        "display": "Cheese Plate", "kcal": 380, "protein": 22.0, "fat": 30.0, "carb": 3.0,
        "iron": 0.5, "vitC": 0.0, "vitA": 200.0, "fiber": 0.0, "sugar": 0.5,
        "calcium": 700.0, "zinc": 3.0, "sodium": 620.0,
        "glyph": "🧀", "tone": "sky", "tag": "Dairy",
    },
    "cheesecake": {
        "display": "Cheesecake", "kcal": 321, "protein": 6.0, "fat": 20.0, "carb": 30.0,
        "iron": 0.5, "vitC": 0.5, "vitA": 110.0, "fiber": 0.5, "sugar": 22.0,
        "calcium": 80.0, "zinc": 0.7, "sodium": 250.0,
        "glyph": "🍰", "tone": "amber", "tag": "Dessert",
    },
    "chicken_curry": {
        "display": "Chicken Curry", "kcal": 290, "protein": 28.0, "fat": 14.0, "carb": 12.0,
        "iron": 2.0, "vitC": 8.0, "vitA": 60.0, "fiber": 2.5, "sugar": 4.0,
        "calcium": 40.0, "zinc": 2.5, "sodium": 720.0,
        "glyph": "🍛", "tone": "amber", "tag": "Curry",
    },
    "chicken_quesadilla": {
        "display": "Chicken Quesadilla", "kcal": 350, "protein": 25.0, "fat": 18.0, "carb": 24.0,
        "iron": 1.5, "vitC": 3.0, "vitA": 60.0, "fiber": 1.5, "sugar": 2.0,
        "calcium": 250.0, "zinc": 2.0, "sodium": 650.0,
        "glyph": "🌮", "tone": "amber", "tag": "Mexican",
    },
    "chicken_wings": {
        "display": "Chicken Wings", "kcal": 290, "protein": 27.0, "fat": 19.0, "carb": 1.0,
        "iron": 1.2, "vitC": 0.0, "vitA": 30.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 18.0, "zinc": 2.5, "sodium": 510.0,
        "glyph": "🍗", "tone": "amber", "tag": "Fried Chicken",
    },
    "chocolate_cake": {
        "display": "Chocolate Cake", "kcal": 380, "protein": 5.0, "fat": 18.0, "carb": 52.0,
        "iron": 2.5, "vitC": 0.0, "vitA": 15.0, "fiber": 2.0, "sugar": 38.0,
        "calcium": 40.0, "zinc": 0.8, "sodium": 290.0,
        "glyph": "🎂", "tone": "amber", "tag": "Dessert",
    },
    "chocolate_mousse": {
        "display": "Chocolate Mousse", "kcal": 280, "protein": 4.5, "fat": 20.0, "carb": 24.0,
        "iron": 2.0, "vitC": 0.0, "vitA": 60.0, "fiber": 1.5, "sugar": 20.0,
        "calcium": 50.0, "zinc": 0.7, "sodium": 50.0,
        "glyph": "🍫", "tone": "amber", "tag": "Dessert",
    },
    "churros": {
        "display": "Churros", "kcal": 370, "protein": 5.0, "fat": 18.0, "carb": 47.0,
        "iron": 1.5, "vitC": 0.0, "vitA": 0.0, "fiber": 1.5, "sugar": 12.0,
        "calcium": 35.0, "zinc": 0.5, "sodium": 190.0,
        "glyph": "🍩", "tone": "amber", "tag": "Spanish Dessert",
    },
    "clam_chowder": {
        "display": "Clam Chowder", "kcal": 190, "protein": 10.0, "fat": 9.0, "carb": 19.0,
        "iron": 3.5, "vitC": 5.0, "vitA": 40.0, "fiber": 1.0, "sugar": 4.0,
        "calcium": 90.0, "zinc": 2.0, "sodium": 650.0,
        "glyph": "🍲", "tone": "sky", "tag": "Seafood Soup",
    },
    "club_sandwich": {
        "display": "Club Sandwich", "kcal": 460, "protein": 30.0, "fat": 22.0, "carb": 38.0,
        "iron": 2.5, "vitC": 5.0, "vitA": 50.0, "fiber": 2.5, "sugar": 5.0,
        "calcium": 80.0, "zinc": 2.5, "sodium": 1050.0,
        "glyph": "🥪", "tone": "amber", "tag": "Sandwich",
    },
    "crab_cakes": {
        "display": "Crab Cakes", "kcal": 180, "protein": 15.0, "fat": 9.0, "carb": 10.0,
        "iron": 0.8, "vitC": 3.0, "vitA": 20.0, "fiber": 0.5, "sugar": 1.0,
        "calcium": 100.0, "zinc": 3.0, "sodium": 520.0,
        "glyph": "🦀", "tone": "sky", "tag": "Seafood",
    },
    "creme_brulee": {
        "display": "Crème Brûlée", "kcal": 300, "protein": 5.0, "fat": 20.0, "carb": 26.0,
        "iron": 0.3, "vitC": 0.0, "vitA": 150.0, "fiber": 0.0, "sugar": 24.0,
        "calcium": 90.0, "zinc": 0.5, "sodium": 55.0,
        "glyph": "🍮", "tone": "amber", "tag": "French Dessert",
    },
    "croque_madame": {
        "display": "Croque Madame", "kcal": 420, "protein": 25.0, "fat": 24.0, "carb": 28.0,
        "iron": 2.0, "vitC": 1.0, "vitA": 130.0, "fiber": 1.5, "sugar": 4.0,
        "calcium": 280.0, "zinc": 2.5, "sodium": 920.0,
        "glyph": "🥪", "tone": "amber", "tag": "French Sandwich",
    },
    "cup_cakes": {
        "display": "Cupcakes", "kcal": 400, "protein": 4.5, "fat": 18.0, "carb": 58.0,
        "iron": 1.0, "vitC": 0.0, "vitA": 40.0, "fiber": 0.5, "sugar": 40.0,
        "calcium": 60.0, "zinc": 0.4, "sodium": 310.0,
        "glyph": "🧁", "tone": "amber", "tag": "Dessert",
    },
    "deviled_eggs": {
        "display": "Deviled Eggs", "kcal": 185, "protein": 12.0, "fat": 14.0, "carb": 2.0,
        "iron": 1.5, "vitC": 0.0, "vitA": 110.0, "fiber": 0.0, "sugar": 1.0,
        "calcium": 35.0, "zinc": 1.1, "sodium": 350.0,
        "glyph": "🥚", "tone": "sky", "tag": "Egg Dish",
    },
    "donuts": {
        "display": "Donuts", "kcal": 420, "protein": 5.0, "fat": 22.0, "carb": 52.0,
        "iron": 1.5, "vitC": 0.0, "vitA": 0.0, "fiber": 1.0, "sugar": 22.0,
        "calcium": 40.0, "zinc": 0.5, "sodium": 330.0,
        "glyph": "🍩", "tone": "amber", "tag": "Dessert",
    },
    "dumplings": {
        "display": "Dumplings", "kcal": 260, "protein": 12.0, "fat": 9.0, "carb": 35.0,
        "iron": 1.8, "vitC": 2.0, "vitA": 10.0, "fiber": 1.5, "sugar": 2.0,
        "calcium": 40.0, "zinc": 1.2, "sodium": 540.0,
        "glyph": "🥟", "tone": "amber", "tag": "Asian",
    },
    "edamame": {
        "display": "Edamame", "kcal": 122, "protein": 11.0, "fat": 5.0, "carb": 10.0,
        "iron": 2.3, "vitC": 9.7, "vitA": 9.0, "fiber": 5.0, "sugar": 2.0,
        "calcium": 63.0, "zinc": 1.4, "sodium": 63.0,
        "glyph": "🫘", "tone": "emerald", "tag": "Plant Protein",
    },
    "eggs_benedict": {
        "display": "Eggs Benedict", "kcal": 370, "protein": 18.0, "fat": 24.0, "carb": 22.0,
        "iron": 2.5, "vitC": 1.0, "vitA": 150.0, "fiber": 1.0, "sugar": 2.0,
        "calcium": 60.0, "zinc": 1.5, "sodium": 860.0,
        "glyph": "🥚", "tone": "sky", "tag": "Breakfast",
    },
    "escargots": {
        "display": "Escargots", "kcal": 90, "protein": 16.0, "fat": 2.0, "carb": 2.0,
        "iron": 3.5, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 170.0, "zinc": 1.0, "sodium": 280.0,
        "glyph": "🐌", "tone": "sky", "tag": "French",
    },
    "falafel": {
        "display": "Falafel", "kcal": 333, "protein": 13.0, "fat": 18.0, "carb": 32.0,
        "iron": 4.0, "vitC": 3.0, "vitA": 5.0, "fiber": 6.0, "sugar": 3.0,
        "calcium": 70.0, "zinc": 1.5, "sodium": 590.0,
        "glyph": "🧆", "tone": "emerald", "tag": "Plant Protein",
    },
    "filet_mignon": {
        "display": "Filet Mignon", "kcal": 250, "protein": 28.0, "fat": 15.0, "carb": 0.0,
        "iron": 3.0, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 20.0, "zinc": 5.0, "sodium": 310.0,
        "glyph": "🥩", "tone": "sky", "tag": "Steak",
    },
    "fish_and_chips": {
        "display": "Fish and Chips", "kcal": 400, "protein": 20.0, "fat": 20.0, "carb": 38.0,
        "iron": 1.2, "vitC": 8.0, "vitA": 15.0, "fiber": 3.0, "sugar": 1.0,
        "calcium": 40.0, "zinc": 1.0, "sodium": 720.0,
        "glyph": "🐟", "tone": "amber", "tag": "British",
    },
    "foie_gras": {
        "display": "Foie Gras", "kcal": 462, "protein": 11.0, "fat": 44.0, "carb": 5.0,
        "iron": 3.5, "vitC": 0.0, "vitA": 1000.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 25.0, "zinc": 1.8, "sodium": 680.0,
        "glyph": "🍖", "tone": "sky", "tag": "French",
    },
    "french_fries": {
        "display": "French Fries", "kcal": 312, "protein": 3.4, "fat": 15.0, "carb": 41.0,
        "iron": 0.9, "vitC": 8.0, "vitA": 0.0, "fiber": 3.5, "sugar": 0.5,
        "calcium": 14.0, "zinc": 0.5, "sodium": 420.0,
        "glyph": "🍟", "tone": "amber", "tag": "Side",
    },
    "french_onion_soup": {
        "display": "French Onion Soup", "kcal": 190, "protein": 10.0, "fat": 8.0, "carb": 18.0,
        "iron": 1.0, "vitC": 5.0, "vitA": 20.0, "fiber": 1.5, "sugar": 7.0,
        "calcium": 200.0, "zinc": 1.0, "sodium": 900.0,
        "glyph": "🍲", "tone": "amber", "tag": "Soup",
    },
    "french_toast": {
        "display": "French Toast", "kcal": 280, "protein": 8.0, "fat": 12.0, "carb": 36.0,
        "iron": 1.8, "vitC": 0.0, "vitA": 90.0, "fiber": 1.0, "sugar": 12.0,
        "calcium": 80.0, "zinc": 0.8, "sodium": 320.0,
        "glyph": "🍞", "tone": "amber", "tag": "Breakfast",
    },
    "fried_calamari": {
        "display": "Fried Calamari", "kcal": 220, "protein": 15.0, "fat": 10.0, "carb": 18.0,
        "iron": 1.0, "vitC": 0.0, "vitA": 10.0, "fiber": 0.5, "sugar": 0.5,
        "calcium": 35.0, "zinc": 1.5, "sodium": 480.0,
        "glyph": "🦑", "tone": "sky", "tag": "Seafood",
    },
    "fried_rice": {
        "display": "Fried Rice", "kcal": 290, "protein": 8.0, "fat": 10.0, "carb": 42.0,
        "iron": 1.5, "vitC": 3.0, "vitA": 30.0, "fiber": 1.5, "sugar": 2.0,
        "calcium": 30.0, "zinc": 1.0, "sodium": 680.0,
        "glyph": "🍚", "tone": "amber", "tag": "Asian",
    },
    "frozen_yogurt": {
        "display": "Frozen Yogurt", "kcal": 159, "protein": 4.0, "fat": 4.0, "carb": 27.0,
        "iron": 0.1, "vitC": 0.5, "vitA": 20.0, "fiber": 0.0, "sugar": 24.0,
        "calcium": 130.0, "zinc": 0.5, "sodium": 70.0,
        "glyph": "🍦", "tone": "sky", "tag": "Dessert",
    },
    "garlic_bread": {
        "display": "Garlic Bread", "kcal": 350, "protein": 8.0, "fat": 16.0, "carb": 44.0,
        "iron": 2.0, "vitC": 1.0, "vitA": 50.0, "fiber": 2.0, "sugar": 2.0,
        "calcium": 60.0, "zinc": 0.8, "sodium": 560.0,
        "glyph": "🧄", "tone": "amber", "tag": "Bread",
    },
    "gnocchi": {
        "display": "Gnocchi", "kcal": 260, "protein": 7.0, "fat": 6.0, "carb": 45.0,
        "iron": 1.5, "vitC": 5.0, "vitA": 0.0, "fiber": 2.0, "sugar": 2.0,
        "calcium": 25.0, "zinc": 0.6, "sodium": 430.0,
        "glyph": "🍝", "tone": "amber", "tag": "Italian",
    },
    "greek_salad": {
        "display": "Greek Salad", "kcal": 180, "protein": 5.0, "fat": 14.0, "carb": 10.0,
        "iron": 1.0, "vitC": 28.0, "vitA": 45.0, "fiber": 3.0, "sugar": 6.0,
        "calcium": 140.0, "zinc": 0.8, "sodium": 740.0,
        "glyph": "🥗", "tone": "emerald", "tag": "Salad",
    },
    "grilled_cheese_sandwich": {
        "display": "Grilled Cheese", "kcal": 400, "protein": 16.0, "fat": 24.0, "carb": 32.0,
        "iron": 1.5, "vitC": 0.0, "vitA": 150.0, "fiber": 1.0, "sugar": 4.0,
        "calcium": 350.0, "zinc": 2.0, "sodium": 820.0,
        "glyph": "🧀", "tone": "amber", "tag": "Sandwich",
    },
    "grilled_salmon": {
        "display": "Grilled Salmon", "kcal": 208, "protein": 28.0, "fat": 10.0, "carb": 0.0,
        "iron": 0.9, "vitC": 0.0, "vitA": 15.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 12.0, "zinc": 0.9, "sodium": 59.0,
        "glyph": "🐟", "tone": "sky", "tag": "Omega-3",
    },
    "guacamole": {
        "display": "Guacamole", "kcal": 160, "protein": 2.0, "fat": 15.0, "carb": 9.0,
        "iron": 0.7, "vitC": 10.0, "vitA": 10.0, "fiber": 6.7, "sugar": 0.7,
        "calcium": 12.0, "zinc": 0.6, "sodium": 250.0,
        "glyph": "🥑", "tone": "emerald", "tag": "Healthy Fat",
    },
    "gyoza": {
        "display": "Gyoza", "kcal": 245, "protein": 12.0, "fat": 10.0, "carb": 28.0,
        "iron": 1.8, "vitC": 3.0, "vitA": 15.0, "fiber": 1.5, "sugar": 2.0,
        "calcium": 35.0, "zinc": 1.0, "sodium": 490.0,
        "glyph": "🥟", "tone": "amber", "tag": "Japanese",
    },
    "hamburger": {
        "display": "Hamburger", "kcal": 540, "protein": 30.0, "fat": 28.0, "carb": 42.0,
        "iron": 3.0, "vitC": 3.0, "vitA": 30.0, "fiber": 2.0, "sugar": 7.0,
        "calcium": 70.0, "zinc": 4.5, "sodium": 820.0,
        "glyph": "🍔", "tone": "amber", "tag": "Burger",
    },
    "hot_and_sour_soup": {
        "display": "Hot and Sour Soup", "kcal": 100, "protein": 6.0, "fat": 3.0, "carb": 12.0,
        "iron": 1.0, "vitC": 2.0, "vitA": 15.0, "fiber": 1.0, "sugar": 3.0,
        "calcium": 30.0, "zinc": 0.8, "sodium": 860.0,
        "glyph": "🍲", "tone": "sky", "tag": "Chinese Soup",
    },
    "hot_dog": {
        "display": "Hot Dog", "kcal": 290, "protein": 11.0, "fat": 17.0, "carb": 23.0,
        "iron": 1.2, "vitC": 0.0, "vitA": 0.0, "fiber": 1.0, "sugar": 5.0,
        "calcium": 50.0, "zinc": 1.5, "sodium": 680.0,
        "glyph": "🌭", "tone": "amber", "tag": "Street Food",
    },
    "huevos_rancheros": {
        "display": "Huevos Rancheros", "kcal": 320, "protein": 18.0, "fat": 18.0, "carb": 24.0,
        "iron": 3.0, "vitC": 12.0, "vitA": 120.0, "fiber": 4.0, "sugar": 3.0,
        "calcium": 100.0, "zinc": 2.0, "sodium": 640.0,
        "glyph": "🍳", "tone": "emerald", "tag": "Mexican Breakfast",
    },
    "hummus": {
        "display": "Hummus", "kcal": 177, "protein": 8.0, "fat": 10.0, "carb": 17.0,
        "iron": 2.9, "vitC": 3.0, "vitA": 5.0, "fiber": 6.0, "sugar": 2.0,
        "calcium": 50.0, "zinc": 1.4, "sodium": 430.0,
        "glyph": "🫙", "tone": "emerald", "tag": "Plant Protein",
    },
    "ice_cream": {
        "display": "Ice Cream", "kcal": 207, "protein": 3.5, "fat": 11.0, "carb": 24.0,
        "iron": 0.1, "vitC": 0.5, "vitA": 95.0, "fiber": 0.0, "sugar": 21.0,
        "calcium": 128.0, "zinc": 0.5, "sodium": 80.0,
        "glyph": "🍨", "tone": "sky", "tag": "Dessert",
    },
    "lasagna": {
        "display": "Lasagna", "kcal": 320, "protein": 18.0, "fat": 14.0, "carb": 30.0,
        "iron": 2.5, "vitC": 4.0, "vitA": 80.0, "fiber": 2.5, "sugar": 6.0,
        "calcium": 180.0, "zinc": 2.0, "sodium": 720.0,
        "glyph": "🍝", "tone": "amber", "tag": "Italian",
    },
    "lobster_bisque": {
        "display": "Lobster Bisque", "kcal": 220, "protein": 12.0, "fat": 12.0, "carb": 16.0,
        "iron": 1.0, "vitC": 3.0, "vitA": 80.0, "fiber": 0.5, "sugar": 5.0,
        "calcium": 120.0, "zinc": 1.5, "sodium": 780.0,
        "glyph": "🦞", "tone": "sky", "tag": "Seafood Soup",
    },
    "lobster_roll_sandwich": {
        "display": "Lobster Roll", "kcal": 360, "protein": 22.0, "fat": 14.0, "carb": 36.0,
        "iron": 1.0, "vitC": 2.0, "vitA": 15.0, "fiber": 1.5, "sugar": 5.0,
        "calcium": 70.0, "zinc": 2.5, "sodium": 720.0,
        "glyph": "🦞", "tone": "sky", "tag": "Seafood",
    },
    "macaroni_and_cheese": {
        "display": "Mac & Cheese", "kcal": 355, "protein": 14.0, "fat": 14.0, "carb": 44.0,
        "iron": 1.5, "vitC": 0.5, "vitA": 80.0, "fiber": 1.5, "sugar": 5.0,
        "calcium": 220.0, "zinc": 1.5, "sodium": 780.0,
        "glyph": "🧀", "tone": "amber", "tag": "Comfort Food",
    },
    "macarons": {
        "display": "Macarons", "kcal": 400, "protein": 6.0, "fat": 16.0, "carb": 60.0,
        "iron": 0.5, "vitC": 0.0, "vitA": 5.0, "fiber": 1.0, "sugar": 50.0,
        "calcium": 30.0, "zinc": 0.4, "sodium": 60.0,
        "glyph": "🍬", "tone": "amber", "tag": "French Pastry",
    },
    "miso_soup": {
        "display": "Miso Soup", "kcal": 40, "protein": 3.0, "fat": 1.5, "carb": 4.0,
        "iron": 0.8, "vitC": 0.0, "vitA": 5.0, "fiber": 0.5, "sugar": 1.0,
        "calcium": 25.0, "zinc": 0.5, "sodium": 630.0,
        "glyph": "🍜", "tone": "sky", "tag": "Japanese Soup",
    },
    "mussels": {
        "display": "Mussels", "kcal": 172, "protein": 24.0, "fat": 4.5, "carb": 7.0,
        "iron": 6.7, "vitC": 8.0, "vitA": 48.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 33.0, "zinc": 2.7, "sodium": 369.0,
        "glyph": "🦪", "tone": "sky", "tag": "High Iron Seafood",
    },
    "nachos": {
        "display": "Nachos", "kcal": 490, "protein": 18.0, "fat": 26.0, "carb": 48.0,
        "iron": 2.0, "vitC": 3.0, "vitA": 80.0, "fiber": 4.0, "sugar": 3.0,
        "calcium": 280.0, "zinc": 2.0, "sodium": 940.0,
        "glyph": "🧀", "tone": "amber", "tag": "Mexican",
    },
    "omelette": {
        "display": "Omelette", "kcal": 220, "protein": 15.0, "fat": 17.0, "carb": 2.0,
        "iron": 2.0, "vitC": 0.5, "vitA": 140.0, "fiber": 0.0, "sugar": 1.0,
        "calcium": 70.0, "zinc": 1.3, "sodium": 340.0,
        "glyph": "🍳", "tone": "sky", "tag": "Egg Dish",
    },
    "onion_rings": {
        "display": "Onion Rings", "kcal": 410, "protein": 5.0, "fat": 26.0, "carb": 40.0,
        "iron": 1.0, "vitC": 3.0, "vitA": 0.0, "fiber": 2.0, "sugar": 3.0,
        "calcium": 30.0, "zinc": 0.5, "sodium": 560.0,
        "glyph": "🧅", "tone": "amber", "tag": "Side",
    },
    "oysters": {
        "display": "Oysters", "kcal": 70, "protein": 9.0, "fat": 2.0, "carb": 4.0,
        "iron": 5.5, "vitC": 3.0, "vitA": 40.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 45.0, "zinc": 16.6, "sodium": 220.0,
        "glyph": "🦪", "tone": "sky", "tag": "High Zinc Seafood",
    },
    "pad_thai": {
        "display": "Pad Thai", "kcal": 400, "protein": 18.0, "fat": 16.0, "carb": 46.0,
        "iron": 2.0, "vitC": 5.0, "vitA": 30.0, "fiber": 2.5, "sugar": 8.0,
        "calcium": 60.0, "zinc": 1.5, "sodium": 780.0,
        "glyph": "🍜", "tone": "amber", "tag": "Thai",
    },
    "paella": {
        "display": "Paella", "kcal": 380, "protein": 25.0, "fat": 12.0, "carb": 42.0,
        "iron": 3.0, "vitC": 8.0, "vitA": 30.0, "fiber": 2.5, "sugar": 2.0,
        "calcium": 60.0, "zinc": 2.5, "sodium": 680.0,
        "glyph": "🥘", "tone": "amber", "tag": "Spanish",
    },
    "pancakes": {
        "display": "Pancakes", "kcal": 330, "protein": 8.0, "fat": 9.0, "carb": 55.0,
        "iron": 2.0, "vitC": 0.0, "vitA": 50.0, "fiber": 1.5, "sugar": 14.0,
        "calcium": 100.0, "zinc": 0.8, "sodium": 530.0,
        "glyph": "🥞", "tone": "amber", "tag": "Breakfast",
    },
    "panna_cotta": {
        "display": "Panna Cotta", "kcal": 240, "protein": 4.0, "fat": 16.0, "carb": 22.0,
        "iron": 0.1, "vitC": 0.0, "vitA": 100.0, "fiber": 0.0, "sugar": 20.0,
        "calcium": 110.0, "zinc": 0.4, "sodium": 60.0,
        "glyph": "🍮", "tone": "sky", "tag": "Italian Dessert",
    },
    "peking_duck": {
        "display": "Peking Duck", "kcal": 380, "protein": 28.0, "fat": 28.0, "carb": 5.0,
        "iron": 2.5, "vitC": 0.0, "vitA": 50.0, "fiber": 0.0, "sugar": 2.0,
        "calcium": 15.0, "zinc": 3.0, "sodium": 640.0,
        "glyph": "🦆", "tone": "amber", "tag": "Chinese",
    },
    "pho": {
        "display": "Pho", "kcal": 340, "protein": 25.0, "fat": 6.0, "carb": 44.0,
        "iron": 3.0, "vitC": 5.0, "vitA": 10.0, "fiber": 2.0, "sugar": 4.0,
        "calcium": 30.0, "zinc": 2.5, "sodium": 860.0,
        "glyph": "🍜", "tone": "sky", "tag": "Vietnamese Noodle",
    },
    "pizza": {
        "display": "Pizza", "kcal": 285, "protein": 12.0, "fat": 10.0, "carb": 36.0,
        "iron": 2.0, "vitC": 3.0, "vitA": 70.0, "fiber": 2.5, "sugar": 4.0,
        "calcium": 200.0, "zinc": 1.5, "sodium": 680.0,
        "glyph": "🍕", "tone": "amber", "tag": "Italian",
    },
    "pork_chop": {
        "display": "Pork Chop", "kcal": 240, "protein": 27.0, "fat": 14.0, "carb": 0.0,
        "iron": 1.0, "vitC": 0.0, "vitA": 5.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 20.0, "zinc": 2.8, "sodium": 480.0,
        "glyph": "🍖", "tone": "amber", "tag": "Pork",
    },
    "poutine": {
        "display": "Poutine", "kcal": 480, "protein": 14.0, "fat": 25.0, "carb": 52.0,
        "iron": 2.0, "vitC": 7.0, "vitA": 10.0, "fiber": 3.5, "sugar": 3.0,
        "calcium": 180.0, "zinc": 1.5, "sodium": 980.0,
        "glyph": "🍟", "tone": "amber", "tag": "Canadian",
    },
    "prime_rib": {
        "display": "Prime Rib", "kcal": 370, "protein": 30.0, "fat": 28.0, "carb": 0.0,
        "iron": 2.8, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 20.0, "zinc": 6.0, "sodium": 380.0,
        "glyph": "🥩", "tone": "sky", "tag": "Beef",
    },
    "pulled_pork_sandwich": {
        "display": "Pulled Pork Sandwich", "kcal": 480, "protein": 28.0, "fat": 18.0, "carb": 48.0,
        "iron": 2.5, "vitC": 3.0, "vitA": 10.0, "fiber": 2.5, "sugar": 12.0,
        "calcium": 60.0, "zinc": 3.0, "sodium": 880.0,
        "glyph": "🥪", "tone": "amber", "tag": "BBQ",
    },
    "ramen": {
        "display": "Ramen", "kcal": 430, "protein": 20.0, "fat": 16.0, "carb": 52.0,
        "iron": 2.5, "vitC": 3.0, "vitA": 20.0, "fiber": 2.0, "sugar": 5.0,
        "calcium": 40.0, "zinc": 2.0, "sodium": 1200.0,
        "glyph": "🍜", "tone": "amber", "tag": "Japanese Noodle",
    },
    "ravioli": {
        "display": "Ravioli", "kcal": 310, "protein": 14.0, "fat": 11.0, "carb": 40.0,
        "iron": 1.8, "vitC": 2.0, "vitA": 50.0, "fiber": 2.0, "sugar": 4.0,
        "calcium": 120.0, "zinc": 1.2, "sodium": 520.0,
        "glyph": "🍝", "tone": "amber", "tag": "Italian Pasta",
    },
    "red_velvet_cake": {
        "display": "Red Velvet Cake", "kcal": 430, "protein": 5.0, "fat": 22.0, "carb": 56.0,
        "iron": 1.5, "vitC": 0.0, "vitA": 30.0, "fiber": 0.5, "sugar": 40.0,
        "calcium": 60.0, "zinc": 0.4, "sodium": 380.0,
        "glyph": "🎂", "tone": "amber", "tag": "Dessert",
    },
    "risotto": {
        "display": "Risotto", "kcal": 310, "protein": 9.0, "fat": 10.0, "carb": 45.0,
        "iron": 1.5, "vitC": 2.0, "vitA": 30.0, "fiber": 1.5, "sugar": 2.0,
        "calcium": 100.0, "zinc": 1.0, "sodium": 540.0,
        "glyph": "🍚", "tone": "amber", "tag": "Italian Rice",
    },
    "samosa": {
        "display": "Samosa", "kcal": 250, "protein": 5.0, "fat": 13.0, "carb": 30.0,
        "iron": 1.5, "vitC": 8.0, "vitA": 10.0, "fiber": 2.5, "sugar": 2.0,
        "calcium": 25.0, "zinc": 0.6, "sodium": 440.0,
        "glyph": "🥟", "tone": "amber", "tag": "Indian",
    },
    "sashimi": {
        "display": "Sashimi", "kcal": 130, "protein": 22.0, "fat": 4.0, "carb": 0.0,
        "iron": 1.0, "vitC": 0.0, "vitA": 30.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 10.0, "zinc": 0.7, "sodium": 50.0,
        "glyph": "🐟", "tone": "sky", "tag": "Japanese Raw Fish",
    },
    "scallops": {
        "display": "Scallops", "kcal": 111, "protein": 20.0, "fat": 1.0, "carb": 5.5,
        "iron": 0.5, "vitC": 0.0, "vitA": 10.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 10.0, "zinc": 1.0, "sodium": 390.0,
        "glyph": "🐚", "tone": "sky", "tag": "Seafood",
    },
    "seaweed_salad": {
        "display": "Seaweed Salad", "kcal": 70, "protein": 1.5, "fat": 4.0, "carb": 8.0,
        "iron": 1.8, "vitC": 2.0, "vitA": 80.0, "fiber": 2.0, "sugar": 2.0,
        "calcium": 60.0, "zinc": 0.5, "sodium": 420.0,
        "glyph": "🥗", "tone": "emerald", "tag": "Japanese",
    },
    "shrimp_and_grits": {
        "display": "Shrimp and Grits", "kcal": 380, "protein": 24.0, "fat": 14.0, "carb": 40.0,
        "iron": 2.0, "vitC": 2.0, "vitA": 60.0, "fiber": 1.5, "sugar": 2.0,
        "calcium": 80.0, "zinc": 1.5, "sodium": 780.0,
        "glyph": "🍤", "tone": "sky", "tag": "Southern US",
    },
    "spaghetti_bolognese": {
        "display": "Spaghetti Bolognese", "kcal": 400, "protein": 22.0, "fat": 14.0, "carb": 47.0,
        "iron": 3.0, "vitC": 5.0, "vitA": 50.0, "fiber": 3.0, "sugar": 5.0,
        "calcium": 60.0, "zinc": 3.0, "sodium": 580.0,
        "glyph": "🍝", "tone": "amber", "tag": "Italian Pasta",
    },
    "spaghetti_carbonara": {
        "display": "Spaghetti Carbonara", "kcal": 450, "protein": 18.0, "fat": 20.0, "carb": 50.0,
        "iron": 1.5, "vitC": 0.0, "vitA": 70.0, "fiber": 2.0, "sugar": 2.0,
        "calcium": 80.0, "zinc": 1.5, "sodium": 620.0,
        "glyph": "🍝", "tone": "amber", "tag": "Italian Pasta",
    },
    "spring_rolls": {
        "display": "Spring Rolls", "kcal": 230, "protein": 6.0, "fat": 11.0, "carb": 28.0,
        "iron": 1.2, "vitC": 5.0, "vitA": 30.0, "fiber": 2.0, "sugar": 3.0,
        "calcium": 30.0, "zinc": 0.6, "sodium": 420.0,
        "glyph": "🥟", "tone": "amber", "tag": "Asian",
    },
    "steak": {
        "display": "Steak", "kcal": 271, "protein": 26.0, "fat": 18.0, "carb": 0.0,
        "iron": 2.5, "vitC": 0.0, "vitA": 0.0, "fiber": 0.0, "sugar": 0.0,
        "calcium": 20.0, "zinc": 4.8, "sodium": 360.0,
        "glyph": "🥩", "tone": "sky", "tag": "Beef",
    },
    "strawberry_shortcake": {
        "display": "Strawberry Shortcake", "kcal": 330, "protein": 5.0, "fat": 14.0, "carb": 48.0,
        "iron": 0.8, "vitC": 32.0, "vitA": 40.0, "fiber": 2.0, "sugar": 25.0,
        "calcium": 75.0, "zinc": 0.4, "sodium": 220.0,
        "glyph": "🍓", "tone": "amber", "tag": "Dessert",
    },
    "sushi": {
        "display": "Sushi", "kcal": 200, "protein": 10.0, "fat": 2.0, "carb": 38.0,
        "iron": 0.8, "vitC": 1.0, "vitA": 20.0, "fiber": 1.5, "sugar": 4.0,
        "calcium": 20.0, "zinc": 0.8, "sodium": 490.0,
        "glyph": "🍣", "tone": "sky", "tag": "Japanese",
    },
    "tacos": {
        "display": "Tacos", "kcal": 350, "protein": 18.0, "fat": 16.0, "carb": 32.0,
        "iron": 2.5, "vitC": 8.0, "vitA": 40.0, "fiber": 3.5, "sugar": 3.0,
        "calcium": 100.0, "zinc": 2.5, "sodium": 680.0,
        "glyph": "🌮", "tone": "amber", "tag": "Mexican",
    },
    "takoyaki": {
        "display": "Takoyaki", "kcal": 200, "protein": 9.0, "fat": 8.0, "carb": 24.0,
        "iron": 1.0, "vitC": 1.0, "vitA": 10.0, "fiber": 0.5, "sugar": 3.0,
        "calcium": 40.0, "zinc": 0.8, "sodium": 480.0,
        "glyph": "🐙", "tone": "amber", "tag": "Japanese Street Food",
    },
    "tiramisu": {
        "display": "Tiramisu", "kcal": 280, "protein": 6.0, "fat": 15.0, "carb": 31.0,
        "iron": 0.8, "vitC": 0.0, "vitA": 80.0, "fiber": 0.5, "sugar": 22.0,
        "calcium": 70.0, "zinc": 0.6, "sodium": 70.0,
        "glyph": "🍰", "tone": "amber", "tag": "Italian Dessert",
    },
    "tuna_tartare": {
        "display": "Tuna Tartare", "kcal": 160, "protein": 24.0, "fat": 5.0, "carb": 4.0,
        "iron": 1.5, "vitC": 5.0, "vitA": 25.0, "fiber": 0.5, "sugar": 1.0,
        "calcium": 20.0, "zinc": 1.0, "sodium": 320.0,
        "glyph": "🐟", "tone": "sky", "tag": "Raw Seafood",
    },
    "waffles": {
        "display": "Waffles", "kcal": 310, "protein": 8.0, "fat": 11.0, "carb": 46.0,
        "iron": 2.0, "vitC": 0.0, "vitA": 45.0, "fiber": 1.5, "sugar": 8.0,
        "calcium": 100.0, "zinc": 0.8, "sodium": 450.0,
        "glyph": "🧇", "tone": "amber", "tag": "Breakfast",
    },

    # ── Rwandan staple foods (FAO East Africa food composition data) ──────────
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
}

_FALLBACK: FoodMeta = {
    "display": "Unknown Food", "kcal": 250, "protein": 10.0, "fat": 10.0, "carb": 30.0,
    "iron": 1.0, "vitC": 2.0, "vitA": 20.0, "fiber": 2.0, "sugar": 5.0,
    "calcium": 50.0, "zinc": 1.0, "sodium": 400.0,
    "glyph": "🍽️", "tone": "amber", "tag": "Food",
}


def get(class_name: str) -> FoodMeta:
    return NUTRITION_DB.get(class_name, _FALLBACK)
