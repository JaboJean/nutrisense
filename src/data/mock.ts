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
  img?: string;
  logged_at?: string;
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
  img?: string;
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
  // Rwandan staples
  { id: "ugali",       name: "Ugali",               category: "Rwandan Staples", kcal: 194, protein: 4.4,  iron: 0.6, fiber: 2.4, vitC: 0,  glyph: "🫕", tone: "amber",   tag: "Staple Grain",     note: "Maize stiff porridge — the most consumed staple in Rwanda",              img: "/foods/ugali.jpg" },
  { id: "isombe",      name: "Isombe",              category: "Rwandan Staples", kcal: 145, protein: 7.0,  iron: 3.2, fiber: 4.8, vitC: 22, glyph: "🌿", tone: "emerald", tag: "Iron-Rich Greens",  note: "Cassava leaves with groundnuts — excellent iron and vitamin A source",    img: "/foods/isombe.jpg" },
  { id: "ibishyimbo",  name: "Ibishyimbo",          category: "Rwandan Staples", kcal: 191, protein: 13.1, iron: 4.4, fiber: 9.6, vitC: 2,  glyph: "🫘", tone: "emerald", tag: "High Iron",         note: "Cooked kidney beans — highest plant iron source in Rwandan diet",        img: "/foods/ibishyimbo.jpg" },
  { id: "matoke",      name: "Matoke",              category: "Rwandan Staples", kcal: 134, protein: 2.0,  iron: 0.9, fiber: 3.9, vitC: 21, glyph: "🍌", tone: "amber",   tag: "Plantain",          note: "Steamed green banana — good fiber and vitamin C",                        img: "/foods/matoke.jpg" },
  { id: "ibirayi",     name: "Ibirayi",             category: "Rwandan Staples", kcal: 129, protein: 2.4,  iron: 0.9, fiber: 4.5, vitC: 29, glyph: "🍠", tone: "emerald", tag: "Vitamin A",         note: "Sweet potato — very high in vitamin A, great for eye health",            img: "/foods/ibirayi.jpg" },
  { id: "umutsima",    name: "Umutsima",            category: "Rwandan Staples", kcal: 170, protein: 3.6,  iron: 1.6, fiber: 3.0, vitC: 0,  glyph: "🫕", tone: "amber",   tag: "Staple Porridge",   note: "Cassava and maize porridge — common daily meal",                         img: "/foods/umutsima.jpg" },
  { id: "agatogo",     name: "Agatogo",             category: "Rwandan Staples", kcal: 210, protein: 10.4, iron: 2.0, fiber: 4.4, vitC: 16, glyph: "🍲", tone: "emerald", tag: "Balanced Meal",     note: "Green banana and bean stew — balanced protein and carbs" },
  { id: "brochettes",  name: "Brochettes",          category: "Rwandan Staples", kcal: 165, protein: 21.0, iron: 2.5, fiber: 0,   vitC: 0,  glyph: "🍢", tone: "sky",     tag: "Lean Protein",      note: "Grilled goat or beef skewers — high protein and iron",                   img: "/foods/brochettes.jpg" },
  { id: "amashaza",    name: "Amashaza",            category: "Rwandan Staples", kcal: 177, protein: 12.5, iron: 2.7, fiber: 8.3, vitC: 1,  glyph: "🫛", tone: "emerald", tag: "High Iron",         note: "Dried peas — good plant protein and iron for daily workers",             img: "/foods/amashaza.jpg" },
  { id: "sambaza",     name: "Sambaza",             category: "Rwandan Staples", kcal: 148, protein: 17.6, iron: 1.4, fiber: 0,   vitC: 0,  glyph: "🐟", tone: "sky",     tag: "Calcium-Rich",      note: "Small Lake Kivu fish — exceptional calcium source",                      img: "/foods/sambaza.jpg" },
  { id: "tilapia",     name: "Tilapia",             category: "Rwandan Staples", kcal: 154, protein: 31.4, iron: 0.8, fiber: 0,   vitC: 0,  glyph: "🐠", tone: "sky",     tag: "Lean Protein",      note: "Grilled Nile tilapia — high protein, low fat",                           img: "/foods/tilapia.jpg" },
  { id: "ikivuguto",   name: "Ikivuguto",           category: "Rwandan Staples", kcal: 130, protein: 9.0,  iron: 0.3, fiber: 0,   vitC: 3,  glyph: "🥛", tone: "sky",     tag: "Calcium-Rich",      note: "Fermented milk — high calcium, traditional probiotic",                   img: "/foods/milk.jpg" },
  { id: "inshyushyu",  name: "Inshyushyu",          category: "Rwandan Staples", kcal: 156, protein: 4.4,  iron: 2.4, fiber: 3.6, vitC: 0,  glyph: "🌾", tone: "amber",   tag: "High Iron",         note: "Millet porridge — good iron and fiber" },
  { id: "sorghumugali",name: "Sorghum Ugali",       category: "Rwandan Staples", kcal: 166, protein: 5.6,  iron: 3.6, fiber: 3.0, vitC: 0,  glyph: "🫕", tone: "emerald", tag: "High Iron Grain",   note: "Sorghum stiff porridge — higher iron than maize ugali",                  img: "/foods/ugali.jpg" },
  { id: "cassava",     name: "Cassava",             category: "Rwandan Staples", kcal: 240, protein: 2.1,  iron: 0.5, fiber: 2.7, vitC: 30, glyph: "🌽", tone: "amber",   tag: "Starchy Staple",    note: "Boiled cassava — high energy, good vitamin C",                           img: "/foods/cassava.jpg" },
  { id: "doodo",       name: "Doodo",               category: "Rwandan Staples", kcal: 23,  protein: 2.5,  iron: 2.3, fiber: 2.2, vitC: 43, glyph: "🥬", tone: "emerald", tag: "Iron-Rich Greens",  note: "Amaranth leaves — excellent iron and vitamin C combination",              img: "/foods/doodo.jpg" },
  { id: "groundnuts",  name: "Groundnuts",          category: "Rwandan Staples", kcal: 170, protein: 7.7,  iron: 1.4, fiber: 2.6, vitC: 0,  glyph: "🥜", tone: "amber",   tag: "Plant Protein",     note: "Roasted peanuts — high fat and protein, common snack",                   img: "/foods/groundnuts.jpg" },
  { id: "avocado",     name: "Avocado",             category: "Rwandan Staples", kcal: 160, protein: 2.0,  iron: 0.6, fiber: 6.7, vitC: 10, glyph: "🥑", tone: "emerald", tag: "Healthy Fats",      note: "Widely grown in Rwanda — healthy fats and fiber",                        img: "/foods/avocado.jpg" },
  { id: "mandazi",     name: "Mandazi",             category: "Rwandan Staples", kcal: 181, protein: 3.3,  iron: 1.1, fiber: 0.9, vitC: 0,  glyph: "🫓", tone: "amber",   tag: "Fried Dough",       note: "Common breakfast street food — high energy, low nutrients",              img: "/foods/mandazi.jpg" },
  { id: "sptleaves",   name: "Sweet Potato Leaves", category: "Rwandan Staples", kcal: 43,  protein: 4.8,  iron: 2.6, fiber: 3.8, vitC: 35, glyph: "🌿", tone: "emerald", tag: "Iron-Rich Greens",  note: "Ikijumba — underused but rich in iron, vitamin A and C",                 img: "/foods/sweet-potato.jpg" },
  // Kenyan classifier foods (KenyanFood13)
  { id: "pilau",       name: "Pilau",        category: "Kenyan Foods", kcal: 285, protein: 12.5, iron: 2.0, fiber: 1.5, vitC: 2,  glyph: "🍛", tone: "amber",   tag: "Spiced Rice",      note: "Kenyan spiced rice with meat",                img: "/foods/pilau.jpg" },
  { id: "nyamachoma",  name: "Nyama Choma",  category: "Kenyan Foods", kcal: 242, protein: 30.0, iron: 2.8, fiber: 0,   vitC: 0,  glyph: "🍖", tone: "sky",     tag: "High Protein",     note: "Kenyan grilled meat — heme iron source",      img: "/foods/brochettes.jpg" },
  { id: "kukuchoma",   name: "Kuku Choma",   category: "Kenyan Foods", kcal: 215, protein: 28.0, iron: 1.3, fiber: 0,   vitC: 0,  glyph: "🍗", tone: "sky",     tag: "Lean Protein",     note: "Kenyan grilled chicken",                      img: "/foods/chicken.jpg" },
  { id: "bhaji",       name: "Bhaji",        category: "Kenyan Foods", kcal: 200, protein: 4.5,  iron: 1.5, fiber: 2.5, vitC: 8,  glyph: "🧅", tone: "amber",   tag: "Fried Snack",      note: "Fried onion snack common in coastal Kenya",   img: "/foods/mandazi.jpg" },
  { id: "chapati",     name: "Chapati",      category: "Kenyan Foods", kcal: 310, protein: 8.5,  iron: 2.1, fiber: 2.2, vitC: 0,  glyph: "🫓", tone: "amber",   tag: "Flatbread",        note: "Kenyan unleavened flatbread",                 img: "/foods/mandazi.jpg" },
  { id: "masalachips", name: "Masala Chips", category: "Kenyan Foods", kcal: 350, protein: 4.5,  iron: 1.2, fiber: 3.5, vitC: 18, glyph: "🍟", tone: "amber",   tag: "Street Food",      note: "Spiced fries — Kenyan street food staple",    img: "/foods/ibirayi.jpg" },
  { id: "sukumawiki",  name: "Sukuma Wiki",  category: "Kenyan Foods", kcal: 55,  protein: 3.5,  iron: 2.9, fiber: 3.2, vitC: 62, glyph: "🥬", tone: "emerald", tag: "Iron-Rich Greens", note: "Kenyan collard greens — high iron and vitC",  img: "/foods/sukuma-wiki.jpg" },
  { id: "githeri",     name: "Githeri",      category: "Kenyan Foods", kcal: 213, protein: 10.8, iron: 3.1, fiber: 8.2, vitC: 4,  glyph: "🫘", tone: "emerald", tag: "High Iron",        note: "Kenyan beans and maize stew",                 img: "/foods/ibishyimbo.jpg" },
  { id: "mukimo",      name: "Mukimo",       category: "Kenyan Foods", kcal: 175, protein: 4.8,  iron: 2.2, fiber: 4.5, vitC: 16, glyph: "🥔", tone: "emerald", tag: "Iron & Vitamin A", note: "Mashed potato with greens and beans",         img: "/foods/ibirayi.jpg" },
  { id: "kachumbari",  name: "Kachumbari",   category: "Kenyan Foods", kcal: 35,  protein: 1.2,  iron: 0.8, fiber: 2.0, vitC: 28, glyph: "🍅", tone: "emerald", tag: "Vitamin C Rich",   note: "Fresh tomato and onion salad",                img: "/foods/doodo.jpg" },
  // General foods
  { id: "spinach",  name: "Spinach",         category: "Vegetables", kcal: 23,  protein: 2.9, iron: 2.7, fiber: 2.2, vitC: 28, glyph: "🥬", tone: "emerald", tag: "High Iron",        note: "Top plant source of iron — pair with Vit C to boost absorption", img: "/foods/sukuma-wiki.jpg" },
  { id: "eggs",     name: "Eggs",            category: "Protein",    kcal: 155, protein: 13,  iron: 1.8, fiber: 0,   vitC: 0,  glyph: "🥚", tone: "sky",     tag: "Complete Protein", note: "All essential amino acids + iron + B12",                          img: "/foods/eggs.jpg" },
  { id: "chicken",  name: "Grilled Chicken", category: "Protein",    kcal: 165, protein: 31,  iron: 1.3, fiber: 0,   vitC: 0,  glyph: "🍗", tone: "amber",   tag: "Lean Protein",     note: "High protein, low fat — heme iron for easy absorption",          img: "/foods/chicken.jpg" },
  { id: "rice",     name: "Brown Rice",      category: "Grains",     kcal: 216, protein: 5,   iron: 1.0, fiber: 3.5, vitC: 0,  glyph: "🍚", tone: "amber",   tag: "Complex Carb",     note: "Whole grain — slower glucose release than white rice",            img: "/foods/pilau.jpg" },
  { id: "sweetpot", name: "Sweet Potato",    category: "Tubers",     kcal: 103, protein: 2.3, iron: 0.7, fiber: 3.8, vitC: 22, glyph: "🍠", tone: "emerald", tag: "Low GI",           note: "Rich in vitamin A and complex carbohydrates",                    img: "/foods/sweet-potato.jpg" },
  { id: "yogurt",   name: "Greek Yogurt",    category: "Dairy",      kcal: 100, protein: 17,  iron: 0.1, fiber: 0,   vitC: 0,  glyph: "🥛", tone: "sky",     tag: "Calcium",          note: "High protein dairy — calcium and B12 source",                    img: "/foods/yogurt.jpg" },
  { id: "banana",   name: "Banana",          category: "Fruits",     kcal: 89,  protein: 1.1, iron: 0.3, fiber: 2.6, vitC: 9,  glyph: "🍌", tone: "amber",   tag: "Energy",           note: "Natural sugars + potassium for sustained energy",                img: "/foods/banana.jpg" },
  { id: "oatmeal",  name: "Oatmeal",         category: "Grains",     kcal: 150, protein: 5.3, iron: 2.1, fiber: 4,   vitC: 0,  glyph: "🌾", tone: "emerald", tag: "High Fiber",       note: "Beta-glucan fiber slows glucose — great breakfast base",         img: "/foods/oatmeal.jpg" },
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
  {
    n: "Ibishyimbo",         b: "+4.4mg Iron · −8% Anemia risk", a: "Daily staple",     s: 96, g: "🫘",
    img: "/foods/ibishyimbo.jpg",
  },
  {
    n: "Isombe",             b: "Iron + Vitamin A · greens",      a: "Cassava leaves",   s: 93, g: "🌿",
    img: "/foods/isombe.jpg",
  },
  {
    n: "Sorghum Ugali",      b: "+3.6mg Iron · high fiber",       a: "Swap maize ugali", s: 90, g: "🫕",
    img: "/foods/ugali.jpg",
  },
  {
    n: "Sweet Potato Leaves",b: "Iron + Vit C + Vit A combo",     a: "Ikijumba greens", s: 86, g: "🌿",
    img: "/foods/sweet-potato.jpg",
  },
];

// ── Quick-add chip list ────────────────────────────────────────────────────────
export const QUICK_ADD_FOODS = [
  "Ugali", "Ibishyimbo", "Isombe", "Brochettes",
  "Matoke", "Ibirayi", "Sambaza", "Ikivuguto",
];
