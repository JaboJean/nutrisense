// ── Types ─────────────────────────────────────────────────────────────────────
export type BadgeTone = "coral" | "amber" | "sky";
export type FoodTone = "emerald" | "amber" | "sky";

export type LogItem = {
  id: string;
  name: string;
  meta: string;
  tag: string;
  tone: FoodTone;
  glyph: string;
  meal: string;
};

export type FoodEntry = {
  id: string;
  name: string;
  category: string;
  kcal: number;
  protein: number;
  iron: number;
  fiber: number;
  vitC: number;
  glyph: string;
  tone: FoodTone;
  tag: string;
  note: string;
};

export type ShapEntry = { f: string; v: number; label: string };

// ── Disease risks ──────────────────────────────────────────────────────────────
export const RISKS = [
  {
    key: "anemia",
    label: "Anemia Risk",
    value: 38,
    badge: "MONITOR",
    badgeTone: "coral" as BadgeTone,
    trend: "+2.4%",
    trendUp: true,
    note: "Iron intake below target for 5 days. Add leafy greens or lentils to boost absorption.",
    color: "#FB7185",
  },
  {
    key: "diabetes",
    label: "Type 2 Diabetes",
    value: 21,
    badge: "STABLE",
    badgeTone: "amber" as BadgeTone,
    trend: "−1.1%",
    trendUp: false,
    note: "Evening high-starch meal patterns are nudging fasting glucose trends.",
    color: "#F59E0B",
  },
  {
    key: "overweight",
    label: "Overweight Risk",
    value: 12,
    badge: "LOW",
    badgeTone: "sky" as BadgeTone,
    trend: "Stable",
    trendUp: false,
    note: "Caloric balance aligned with movement levels this week.",
    color: "#38BDF8",
  },
];

// ── SHAP explanations per disease ──────────────────────────────────────────────
export const SHAP_BY_DISEASE: Record<string, ShapEntry[]> = {
  anemia: [
    { f: "Iron intake",     v: -0.42, label: "Below daily target" },
    { f: "Vitamin C",       v: -0.18, label: "Low — limits iron absorption" },
    { f: "Legumes",         v: +0.34, label: "Protective — plant iron source" },
    { f: "Leafy greens",    v: +0.26, label: "Protective — non-heme iron" },
    { f: "Sugar load",      v: -0.12, label: "Slight negative factor" },
  ],
  diabetes: [
    { f: "Starchy carbs",   v: -0.38, label: "High glycemic load" },
    { f: "Fiber intake",    v: +0.22, label: "Protective — slows glucose" },
    { f: "Legumes",         v: +0.18, label: "Low GI buffer" },
    { f: "Sugar from juice",v: -0.28, label: "Spike risk" },
    { f: "Physical activity",v: +0.31, label: "Protective" },
  ],
  overweight: [
    { f: "Caloric balance", v: +0.28, label: "On target" },
    { f: "Vegetable intake",v: +0.22, label: "Protective" },
    { f: "Refined carbs",   v: -0.15, label: "Slight risk" },
    { f: "Water intake",    v: +0.12, label: "Supports satiety" },
    { f: "Late-night meals",v: -0.08, label: "Minor factor" },
  ],
};

// ── Food database ─────────────────────────────────────────────────────────────
export const FOOD_DATABASE: FoodEntry[] = [
  { id: "spinach",  name: "Spinach",         category: "Vegetables", kcal: 23,  protein: 2.9, iron: 2.7, fiber: 2.2, vitC: 28, glyph: "🥬", tone: "emerald", tag: "High Iron",       note: "Top plant source of iron — pair with Vit C to boost absorption" },
  { id: "eggs",     name: "Eggs",            category: "Protein",    kcal: 155, protein: 13,  iron: 1.8, fiber: 0,   vitC: 0,  glyph: "🥚", tone: "sky",     tag: "Complete Protein",note: "All essential amino acids + iron + B12" },
  { id: "lentils",  name: "Lentil Soup",     category: "Legumes",    kcal: 230, protein: 18,  iron: 6.6, fiber: 15.6,vitC: 3,  glyph: "🫘", tone: "emerald", tag: "High Iron",       note: "Highest plant iron source, low glycemic index" },
  { id: "chicken",  name: "Grilled Chicken", category: "Protein",    kcal: 165, protein: 31,  iron: 1.3, fiber: 0,   vitC: 0,  glyph: "🍗", tone: "amber",   tag: "Lean Protein",    note: "High protein, low fat — heme iron for easy absorption" },
  { id: "salmon",   name: "Grilled Salmon",  category: "Protein",    kcal: 208, protein: 28,  iron: 0.9, fiber: 0,   vitC: 0,  glyph: "🐟", tone: "sky",     tag: "Omega-3",         note: "Rich in omega-3 fatty acids and zinc" },
  { id: "broccoli", name: "Broccoli",        category: "Vegetables", kcal: 55,  protein: 3.7, iron: 0.7, fiber: 2.6, vitC: 89, glyph: "🥦", tone: "emerald", tag: "Vit C",           note: "High vitamin C enhances iron absorption from other foods" },
  { id: "rice",     name: "Brown Rice",      category: "Grains",     kcal: 216, protein: 5,   iron: 1.0, fiber: 3.5, vitC: 0,  glyph: "🍚", tone: "amber",   tag: "Complex Carb",    note: "Whole grain — slower glucose release than white rice" },
  { id: "sweetpot", name: "Sweet Potato",    category: "Tubers",     kcal: 103, protein: 2.3, iron: 0.7, fiber: 3.8, vitC: 22, glyph: "🍠", tone: "emerald", tag: "Low GI",          note: "Rich in vitamin A and complex carbohydrates" },
  { id: "hummus",   name: "Hummus",          category: "Legumes",    kcal: 177, protein: 8,   iron: 2.9, fiber: 6,   vitC: 3,  glyph: "🫙", tone: "amber",   tag: "Plant Protein",   note: "Chickpea-based — iron, fiber and healthy fats" },
  { id: "yogurt",   name: "Greek Yogurt",    category: "Dairy",      kcal: 100, protein: 17,  iron: 0.1, fiber: 0,   vitC: 0,  glyph: "🥛", tone: "sky",     tag: "Calcium",         note: "High protein dairy — calcium and B12 source" },
  { id: "banana",   name: "Banana",          category: "Fruits",     kcal: 89,  protein: 1.1, iron: 0.3, fiber: 2.6, vitC: 9,  glyph: "🍌", tone: "amber",   tag: "Energy",          note: "Natural sugars + potassium for sustained energy" },
  { id: "oatmeal",  name: "Oatmeal",         category: "Grains",     kcal: 150, protein: 5.3, iron: 2.1, fiber: 4,   vitC: 0,  glyph: "🌾", tone: "emerald", tag: "High Fiber",      note: "Beta-glucan fiber slows glucose — great breakfast base" },
];

// ── Today's food log (initial state) ──────────────────────────────────────────
export const INITIAL_LOG: LogItem[] = [
  { id: "log-1", name: "Scrambled Eggs & Toast", meta: "Breakfast · 310 kcal · 3.6mg Iron", tag: "Complete Protein", tone: "sky",     glyph: "🥚", meal: "Breakfast" },
  { id: "log-2", name: "Grilled Chicken & Rice", meta: "Lunch · 381 kcal · 2.3mg Iron",    tag: "Lean Protein",     tone: "amber",   glyph: "🍗", meal: "Lunch" },
  { id: "log-3", name: "Lentil Soup & Broccoli", meta: "Dinner · 285 kcal · 7.3mg Iron",   tag: "High Iron",        tone: "emerald", glyph: "🫘", meal: "Dinner" },
  { id: "log-4", name: "Greek Yogurt & Banana",  meta: "Snack · 189 kcal · Calcium",       tag: "Calcium",          tone: "sky",     glyph: "🥛", meal: "Snack" },
];

// ── Trend data ─────────────────────────────────────────────────────────────────
export const TREND_7D = [
  { d: "Mon", score: 71, iron: 8 },
  { d: "Tue", score: 74, iron: 10 },
  { d: "Wed", score: 70, iron: 7 },
  { d: "Thu", score: 78, iron: 11 },
  { d: "Fri", score: 80, iron: 12 },
  { d: "Sat", score: 82, iron: 13 },
  { d: "Sun", score: 84, iron: 14 },
];

export const TREND_30D = Array.from({ length: 30 }, (_, i) => ({
  d: `${i + 1}`,
  score: Math.min(92, 62 + Math.round(i * 0.72 + Math.sin(i * 0.7) * 4)),
  iron:  Math.min(16, 6  + Math.round(i * 0.28 + Math.cos(i * 0.8) * 1.5)),
}));

export const TREND_90D = Array.from({ length: 13 }, (_, i) => ({
  d: `W${i + 1}`,
  score: Math.min(92, 58 + Math.round(i * 2.6 + Math.sin(i * 0.5) * 5)),
  iron:  Math.min(16, 5  + Math.round(i * 0.85 + Math.cos(i * 0.6) * 2)),
}));

// ── Recommendations ────────────────────────────────────────────────────────────
export const RECOMMENDATIONS = [
  { n: "Spinach",      b: "+2.7mg Iron · −6% Anemia risk", a: "Fresh or frozen", s: 96, g: "🥬" },
  { n: "Lentil Soup",  b: "Plant protein · low GI",         a: "Pantry staple",   s: 92, g: "🫘" },
  { n: "Sweet Potato", b: "Vitamin A · stable energy",      a: "Whole food carb", s: 88, g: "🍠" },
  { n: "Oatmeal",      b: "Fiber · slow carb release",      a: "Breakfast swap",  s: 84, g: "🌾" },
];

// ── Quick-add chip list ────────────────────────────────────────────────────────
export const QUICK_ADD_FOODS = [
  "Eggs", "Chicken", "Brown Rice", "Salmon",
  "Spinach", "Broccoli", "Banana", "Oatmeal",
];
