# Nutrisense-AI

**Personal disease risk intelligence, calibrated for East Africa.**

Most nutrition apps were built for Western diets and have never heard of Isombe, Ibishyimbo, or Matoke. Nutrisense-AI is built differently: it lets Rwandan users photograph their everyday meals, tracks nutritional intake in real time, and predicts personalised risk scores for anemia, type 2 diabetes, and overweight using machine learning models trained on Rwanda DHS + STEPS Rwanda 2012 microdata, so the predictions reflect East African realities, not Western averages.

> **Live app →** [nutrisense-ai.vercel.app](https://nutrisense-ai.vercel.app)
> **ML API →** [huggingface.co/spaces/JeanJabo/nutrisense-api](https://huggingface.co/spaces/JeanJabo/nutrisense-api)
> **Demo video →** [Demo](https://drive.google.com/file/d/1z0Ppa8AcZ74I0IZvsXgDr0MfM6gR5Iwe/view?usp=drive_link)

---

## The Problem

Rwanda and East Africa face a dual burden of malnutrition. Existing tools (ZOE, DayTwo) cost USD 300–2,000 and are trained on Western food databases. Apps like MyFitnessPal lack disease prediction entirely and do not cover Rwandan staples like Isombe, Ibihaza, Ugali, or Matoke.

| Disease | Rwanda prevalence (DHS 2019-20) |
|---------|-------------------------------|
| Anemia (women 15–49) | ~22% |
| Overweight | ~22% |
| Diabetes | ~3.4% |

Nutrisense-AI is a free, accessible web platform that predicts personalised risk for all three conditions from daily food logs, calibrated to this population.

---

## Architecture

```
Browser (TanStack Start / React 19)
        │
        ├── Supabase  (auth + food log storage)
        │
        └── HuggingFace Spaces (FastAPI — Docker)
                ├── POST /api/predict/food   ← ViT-B/16 image classifier (114 classes)
                ├── POST /api/predict/risk   ← GradientBoosting × 3 + SHAP
                └── GET  /health
                          │
                          └── HuggingFace Model Repo (weights downloaded at startup)
```

| Layer | Technology |
|-------|-----------|
| Frontend | TanStack Start, React 19, TailwindCSS 4, Vite |
| Auth & DB | Supabase (PostgreSQL + Row-Level Security) |
| Food classifier | ViT-B/16 (`vit_base_patch16_224.orig_in21k`) fine-tuned on Food-101 + KenyanFood13 (114 classes) |
| Risk models | GradientBoostingClassifier × 3 (scikit-learn) + SHAP TreeExplainer |
| Nutrition lookup | Hand-curated `nutrition_db.py` (132 entries, 12 nutrient fields) |
| Training data | DHS Rwanda + STEPS Rwanda 2012 microdata (risk) · Food-101 + KenyanFood13 (food classifier) |
| Model storage | HuggingFace Model Repo `JeanJabo/nutrisense-food-model` (50 GB) |
| API | FastAPI + Uvicorn, Docker on HuggingFace Spaces |
| Deployment | Vercel (frontend) · HuggingFace Spaces (API) |

---

## Installation — Frontend

### Prerequisites
- Node.js ≥ 18
- A Supabase project (free tier works)

```bash
# 1. Clone
git clone https://github.com/JaboJean/nutrisense.git
cd nutrisense

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ML_API_URL=https://jeanjabox-nutrisense-api.hf.space
```

```bash
# 4. Run
npm run dev
# → http://localhost:3000
```

---

## Installation — ML API (local)

### Prerequisites
- Python ≥ 3.10

```bash
cd api

# 1. Create virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# → http://localhost:8000/docs  (Swagger UI)
```

On first start the API downloads `food_finetuned_model.pth` (~350 MB), `class_names.txt`, and `nutrisense_model.joblib` from the HuggingFace Model Repo automatically.

Set `VITE_ML_API_URL=http://localhost:8000` in `.env.local` to point the frontend at your local API.

---

## Database Setup (Supabase)

Run this SQL in your Supabase SQL editor (**SQL Editor → New query**):

```sql
-- Profiles
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  age        integer,
  sex        text check (sex in ('male','female')),
  weight_kg  numeric,
  height_cm  numeric,
  created_at timestamptz default now()
);

-- Food logs
create table food_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  name       text not null,
  meta       text,
  meal       text,
  tag        text,
  tone       text,
  glyph      text,
  img        text,
  logged_at  timestamptz default now()
);

-- Row-level security
alter table profiles   enable row level security;
alter table food_logs  enable row level security;

create policy "Users manage own profile"
  on profiles for all using (auth.uid() = id);

create policy "Users manage own logs"
  on food_logs for all using (auth.uid() = user_id);
```

Then go to **Authentication → Email** and **disable "Confirm email"** so the 3-step onboarding flow redirects directly to the dashboard.

---

## API Reference

| Method | Endpoint              | Description                                                       |
|--------|-----------------------|-------------------------------------------------------------------|
| `GET`  | `/health`             | Health check                                                      |
| `POST` | `/api/predict/food`   | Classify a food photo (`multipart/form-data`, field: `file`)      |
| `POST` | `/api/predict/risk`   | Predict risk scores from food logs + profile                      |

**Risk prediction request:**
```json
{
  "logs":    [{ "name": "ugali", "meal": "Lunch" }, { "name": "isombe", "meal": "Lunch" }],
  "profile": { "age": 24, "sex": "female", "weightKg": 58, "heightCm": 165 }
}
```

**Response:**
```json
{
  "scores": { "anemia": 38, "diabetes": 3, "overweight": 9, "overall": 17 },
  "shap": {
    "anemia": [
      { "f": "Iron intake",  "v": -0.21 },
      { "f": "Vitamin C",    "v": -0.08 }
    ]
  }
}
```

SHAP values follow GradientBoosting TreeExplainer sign convention: positive = increases disease risk, negative = reduces risk.

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| DHS Rwanda + STEPS Rwanda 2012 microdata | Ground-truth population data from Rwanda rather than generic or Western datasets |
| 114-class food classifier | Food-101 (101 classes, 101K images) + KenyanFood13 (13 East African classes, ~4K images) merged and fine-tuned on ViT-B/16; covers both global and regional staples |
| Meal-count scaling before inference | Models trained on daily totals; `scale = max(1.0, 3.0 / n_meals)` extrapolates partial logs without collapsing the calorie signal used by overweight/diabetes models |
| SHAP TreeExplainer | Per-prediction explainability — users see *why* each score changed, not just the number |
| GradientBoostingClassifier × 3 (class-weighted) | Separate binary classifiers for anemia, type 2 diabetes, and overweight; class-weighting handles Rwanda's imbalanced prevalence rates |
| Harris-Benedict × 1.4 for calorie goals | Personalised daily targets from user age, sex, weight, and height |
| Scores capped at 90 | Raw GBM probabilities can be overconfident; cap prevents display of false certainty |

---

## Project Structure

```
nutrisense/
├── api/                          # FastAPI ML backend (deployed to HuggingFace Spaces)
│   ├── main.py                   # Routes + lifespan handler (pre-warms both models)
│   ├── food_predictor.py         # ViT-B/16 inference (114 classes)
│   ├── risk_predictor.py         # GradientBoosting inference + SHAP
│   ├── nutrition_db.py           # Nutrient lookup (132 entries, East African foods)
│   ├── requirements.txt
│   └── README.md                 # HuggingFace Space config (YAML frontmatter)
├── src/
│   ├── routes/                   # Pages: index, dashboard, login, signup
│   ├── components/dashboard/     # All dashboard UI components
│   ├── hooks/                    # useAuth, useProfile, useFoodLogs
│   └── lib/                      # mlApi client, Supabase client
├── ML/
│   ├── nutrisense_training.ipynb # Full training pipeline (ViT fine-tuning + GradientBoosting)
│   └── outputs/                  # ROC curves, SHAP plots, confusion matrices
└── push_to_hf.py                 # Upload API files to HuggingFace Space via HF API
```

---

## ML Training

The notebook is in `ML/nutrisense_training.ipynb`. Run on **Kaggle** (GPU T4 or P100 recommended):

1. Add the `dansbecker/food-101` dataset as a Kaggle input (Food-101)
2. Add the `kmader/food41` or KenyanFood13 dataset for East African classes
3. Add your `HF_TOKEN` as a Kaggle secret
4. Run `nutrisense_training.ipynb` end-to-end — it trains ViT-B/16 on 114 classes and three GradientBoosting classifiers, then pushes weights to `JeanJabo/nutrisense-food-model`

> **Note:** Risk model training requires DHS Rwanda + STEPS Rwanda 2012 microdata. These datasets are restricted-license WHO/DHS microdata and **must not** be committed to any public repository or redistributed.

Training outputs (ROC curves, confusion matrices, SHAP plots, CV results) are saved in `ML/outputs/`.

---

## Deploying API Updates

**Option 1 — Upload individual files (fast):**

```bash
python push_to_hf.py --token hf_YOUR_TOKEN_HERE
```

Uploads `risk_predictor.py`, `nutrition_db.py`, `food_predictor.py`, and `requirements.txt` to the Space.

**Option 2 — Full git subtree push (recommended for `main.py` or `README.md` changes):**

```bash
git push space "$(git subtree split --prefix api main)":main --force
```

Pushes the entire `api/` directory as the Space's `main` branch and triggers a Docker rebuild (~2 min).

---

## Limitations & Future Work

- **Food classifier scope**: 114 classes cover Food-101 staples plus 13 East African dishes (KenyanFood13). Rwanda-specific dishes not in either dataset (e.g. Ibihaza, Umutsima) surface their closest match with an amber confidence warning.
- **Risk model calibration**: GradientBoosting without Platt scaling can produce overconfident raw probabilities; scores are capped at 90 and meal-count scaling is applied before inference.
- **Data recency**: Risk models trained on STEPS Rwanda 2012 data; Rwanda's nutrition profile has shifted since then.
- **Future**: Fine-tune on a Rwanda-augmented food dataset; add Platt scaling to risk models; extend to hydration and activity tracking; add nutritionist dashboard for patient oversight.

---

## Research Targets

| Metric | Target | Achieved |
|--------|--------|---------|
| Food classifier top-1 accuracy | ≥ 75% | See `ML/outputs/07_confusion_matrix.png` |
| Risk model AUROC | ≥ 0.75 | See `ML/outputs/13_roc_pr_curves.png` |
| API response time | < 3 s | ~1.2 s (HuggingFace Space) |

---

## Author

**JABO Jean Jacques** — BSc Software Engineering, African Leadership University
Supervisor: Murairi Dirac
