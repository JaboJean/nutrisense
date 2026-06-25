export const RISKS = [
  {
    key: "anemia",
    label: "Anemia Risk",
    value: 38,
    badge: "MONITOR",
    badgeTone: "coral" as const,
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
    badgeTone: "amber" as const,
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
    badgeTone: "sky" as const,
    trend: "Stable",
    trendUp: false,
    note: "Caloric balance aligned with movement levels this week.",
    color: "#38BDF8",
  },
];

export const FOODS = [
  { name: "Isombe & Rice", meta: "Lunch · 420 kcal · 12mg Iron", tag: "High Iron", tone: "emerald", glyph: "🥬" },
  { name: "Ubugali & Ibishyimbo", meta: "Dinner · 580 kcal · Beans", tag: "Complex Carb", tone: "amber", glyph: "🫘" },
  { name: "Steamed Matoke", meta: "Breakfast · 310 kcal · Plantain", tag: "Balanced", tone: "sky", glyph: "🍌" },
  { name: "Sweet Potato & Sorghum", meta: "Snack · 240 kcal · Fiber", tag: "Low GI", tone: "emerald", glyph: "🍠" },
];

export const TREND = [
  { d: "Mon", score: 71, iron: 8 },
  { d: "Tue", score: 74, iron: 10 },
  { d: "Wed", score: 70, iron: 7 },
  { d: "Thu", score: 78, iron: 11 },
  { d: "Fri", score: 80, iron: 12 },
  { d: "Sat", score: 82, iron: 13 },
  { d: "Sun", score: 84, iron: 14 },
];

export const SHAP = [
  { f: "Iron intake", v: -0.42, label: "Below target" },
  { f: "Vitamin C", v: -0.18, label: "Limits absorption" },
  { f: "Legumes (Ibishyimbo)", v: +0.34, label: "Protective" },
  { f: "Leafy greens (Isombe)", v: +0.26, label: "Protective" },
  { f: "Sugar load", v: -0.12, label: "Slight" },
];

export const RECOMMENDATIONS = [
  { n: "Isombe", b: "+12mg Iron · −6% Anemia", a: "Local · in season", s: 96, g: "🥬" },
  { n: "Ibishyimbo", b: "Plant protein · low GI", a: "Local · pantry staple", s: 92, g: "🫘" },
  { n: "Sweet Potato", b: "Vit A · stable energy", a: "Local · market", s: 88, g: "🍠" },
  { n: "Sorghum porridge", b: "Fiber · slow carb", a: "Local · breakfast swap", s: 84, g: "🌾" },
];

export const RWANDAN_FOODS = [
  "Isombe", "Ubugali", "Ibishyimbo", "Matoke",
  "Sweet Potato", "Cassava", "Rice", "Sorghum",
];
