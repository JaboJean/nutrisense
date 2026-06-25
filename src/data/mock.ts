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
  nameKin: string;
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
    note: "Iron intake under target 5 days. Suggest Isombe + Ibishyimbo at lunch.",
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
    note: "Evening starch loads from Ubugali nudging fasting glucose.",
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
    { f: "Iron intake", v: -0.42, label: "Below target" },
    { f: "Vitamin C", v: -0.18, label: "Limits absorption" },
    { f: "Legumes (Ibishyimbo)", v: +0.34, label: "Protective" },
    { f: "Leafy greens (Isombe)", v: +0.26, label: "Protective" },
    { f: "Sugar load", v: -0.12, label: "Slight" },
  ],
  diabetes: [
    { f: "Evening starch (Ubugali)", v: -0.38, label: "High GL" },
    { f: "Fiber intake", v: +0.22, label: "Protective" },
    { f: "Legumes (Ibishyimbo)", v: +0.18, label: "Low GI buffer" },
    { f: "Sugar from juice", v: -0.28, label: "Spike risk" },
    { f: "Physical activity", v: +0.31, label: "Protective" },
  ],
  overweight: [
    { f: "Caloric balance", v: +0.28, label: "On target" },
    { f: "Vegetable intake", v: +0.22, label: "Protective" },
    { f: "Refined carbs", v: -0.15, label: "Slight risk" },
    { f: "Water intake", v: +0.12, label: "Satiety" },
    { f: "Late-night meals", v: -0.08, label: "Minor factor" },
  ],
};

// ── Food database (Rwandan staples) ───────────────────────────────────────────
export const FOOD_DATABASE: FoodEntry[] = [
  { id: "isombe", name: "Isombe", nameKin: "Isombe", category: "Vegetables", kcal: 80, protein: 4.2, iron: 3.2, fiber: 2.8, vitC: 12, glyph: "🥬", tone: "emerald", tag: "High Iron", note: "Cassava leaves, rich in iron & folate" },
  { id: "ubugali", name: "Ubugali", nameKin: "Ubugali", category: "Staples", kcal: 320, protein: 1.8, iron: 0.8, fiber: 1.2, vitC: 0, glyph: "⬜", tone: "amber", tag: "Complex Carb", note: "Maize/cassava stiff porridge, energy staple" },
  { id: "ibishyimbo", name: "Ibishyimbo", nameKin: "Ibishyimbo", category: "Legumes", kcal: 230, protein: 15, iron: 4.6, fiber: 8.5, vitC: 4, glyph: "🫘", tone: "emerald", tag: "High Protein", note: "Beans — plant protein & low glycemic" },
  { id: "matoke", name: "Matoke", nameKin: "Matoke", category: "Fruits", kcal: 310, protein: 1.4, iron: 0.6, fiber: 2.6, vitC: 18, glyph: "🍌", tone: "sky", tag: "Balanced", note: "Steamed green plantain, potassium-rich" },
  { id: "ibijumba", name: "Sweet Potato", nameKin: "Ibijumba", category: "Tubers", kcal: 240, protein: 2.1, iron: 0.7, fiber: 3.8, vitC: 22, glyph: "🍠", tone: "emerald", tag: "Low GI", note: "Rich in Vit A & complex carbs" },
  { id: "sorghum", name: "Sorghum Porridge", nameKin: "Amazina", category: "Grains", kcal: 200, protein: 6.5, iron: 3.8, fiber: 5.2, vitC: 0, glyph: "🌾", tone: "amber", tag: "High Fiber", note: "Slow-release energy, great for breakfast" },
  { id: "cassava", name: "Cassava", nameKin: "Imyumbati", category: "Tubers", kcal: 280, protein: 1.4, iron: 0.4, fiber: 1.8, vitC: 20, glyph: "🍡", tone: "amber", tag: "Energy", note: "Starchy tuber, good Vit C source" },
  { id: "rice", name: "Rice", nameKin: "Umuceli", category: "Grains", kcal: 350, protein: 3.2, iron: 0.9, fiber: 0.6, vitC: 0, glyph: "🍚", tone: "sky", tag: "Staple", note: "Commonly paired with Isombe or beans" },
  { id: "chicken", name: "Chicken", nameKin: "Inyama y'inkoko", category: "Protein", kcal: 165, protein: 31, iron: 1.3, fiber: 0, vitC: 0, glyph: "🍗", tone: "amber", tag: "Lean Protein", note: "High protein, low fat option" },
  { id: "eggs", name: "Eggs", nameKin: "Amagi", category: "Protein", kcal: 155, protein: 13, iron: 1.8, fiber: 0, vitC: 0, glyph: "🥚", tone: "sky", tag: "Complete Protein", note: "All essential amino acids + iron" },
  { id: "tomato", name: "Tomatoes", nameKin: "Ingomba", category: "Vegetables", kcal: 35, protein: 0.9, iron: 0.3, fiber: 1.2, vitC: 28, glyph: "🍅", tone: "emerald", tag: "Vit C", note: "Boosts iron absorption from plant foods" },
  { id: "milk", name: "Milk", nameKin: "Amata", category: "Dairy", kcal: 120, protein: 8.1, iron: 0.1, fiber: 0, vitC: 2, glyph: "🥛", tone: "sky", tag: "Calcium", note: "Calcium + B12, pair with iron sources carefully" },
];

// ── Today's food log (initial state) ──────────────────────────────────────────
export const INITIAL_LOG: LogItem[] = [
  { id: "log-1", name: "Isombe & Rice", meta: "Lunch · 420 kcal · 12mg Iron", tag: "High Iron", tone: "emerald", glyph: "🥬", meal: "Lunch" },
  { id: "log-2", name: "Ubugali & Ibishyimbo", meta: "Dinner · 580 kcal · Beans", tag: "Complex Carb", tone: "amber", glyph: "🫘", meal: "Dinner" },
  { id: "log-3", name: "Steamed Matoke", meta: "Breakfast · 310 kcal · Plantain", tag: "Balanced", tone: "sky", glyph: "🍌", meal: "Breakfast" },
  { id: "log-4", name: "Sweet Potato & Sorghum", meta: "Snack · 240 kcal · Fiber", tag: "Low GI", tone: "emerald", glyph: "🍠", meal: "Snack" },
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
  iron: Math.min(16, 6 + Math.round(i * 0.28 + Math.cos(i * 0.8) * 1.5)),
}));

export const TREND_90D = Array.from({ length: 13 }, (_, i) => ({
  d: `W${i + 1}`,
  score: Math.min(92, 58 + Math.round(i * 2.6 + Math.sin(i * 0.5) * 5)),
  iron: Math.min(16, 5 + Math.round(i * 0.85 + Math.cos(i * 0.6) * 2)),
}));

// ── Recommendations ────────────────────────────────────────────────────────────
export const RECOMMENDATIONS = [
  { n: "Isombe", b: "+12mg Iron · −6% Anemia", a: "Local · in season", s: 96, g: "🥬" },
  { n: "Ibishyimbo", b: "Plant protein · low GI", a: "Local · pantry staple", s: 92, g: "🫘" },
  { n: "Sweet Potato", b: "Vit A · stable energy", a: "Local · market", s: 88, g: "🍠" },
  { n: "Sorghum porridge", b: "Fiber · slow carb", a: "Local · breakfast swap", s: 84, g: "🌾" },
];

// ── Quick-add chip list ────────────────────────────────────────────────────────
export const RWANDAN_FOODS = [
  "Isombe", "Ubugali", "Ibishyimbo", "Matoke",
  "Sweet Potato", "Cassava", "Rice", "Sorghum",
];
