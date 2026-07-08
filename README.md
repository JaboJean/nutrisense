# Nutrisense-AI

**Personal disease risk intelligence, calibrated for East Africa.**

Most nutrition apps were built for Western diets and have never heard of Isombe, Ibishyimbo, or Matoke. Nutrisense-AI is built differently: it lets Rwandan users photograph their everyday meals, tracks nutritional intake in real time, and predicts personalised risk scores for anemia, type 2 diabetes, and overweight using machine learning models trained directly on Rwanda DHS 2019-20 population data, so the predictions reflect East African realities, not Western averages.

> **Live app →** [nutrisense-ai.vercel.app](https://nutrisense-ai.vercel.app)
> **ML API →** [huggingface.co/spaces/JeanJabo/nutrisense-api](https://huggingface.co/spaces/JeanJabo/nutrisense-api)
> **Demo video →** *(add link here after recording)*

---

## The Problem

Rwanda and East Africa face a dual burden of malnutrition. Existing tools (ZOE, DayTwo) cost USD 300–2,000 and are trained on Western food databases. Apps like MyFitnessPal lack disease prediction entirely and do not cover Rwandan staples like Isombe, Ibishyimbo, Ugali, or Matoke.

| Disease | Rwanda prevalence (DHS 2019-20) |
|---------|-------------------------------|
| Anemia (women 15–49) | ~22% |
| Overweight | ~22% |
| Diabetes | ~3.4% |

Nutrisense-AI is a free, accessible web platform that predicts personalised risk for all three conditions from daily food logs, calibrated to this population.

---

## Architecture

```
Browser (React / TanStack Start)
        │
        ├── Supabase  (auth + food log storage)
        │
        └── HuggingFace Space (FastAPI)
                ├── POST /api/predict/food   ← ViT image classifier (KenyanFood13, 13 classes)
                └── POST /api/predict/risk   ← XGBoost risk models × 3 + SHAP
```

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TailwindCSS |
| Auth & DB | Supabase (PostgreSQL + Row-Level Security) |
| Food classifier | ViT `vit_base_patch16_224` fine-tuned on KenyanFood13 |
| Risk models | XGBoost + StandardScaler pipeline, SHAP TreeExplainer |
| Training data | Rwanda DHS 2019-20 (risk) · KenyanFood13 (food classifier) |
| API | FastAPI + Uvicorn on HuggingFace Spaces |
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

The API downloads `nutrisense_model.joblib` (~150 MB) from HuggingFace automatically on first start.

Set `VITE_ML_API_URL=http://localhost:8000` in `.env.local` to use your local API.

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

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/api/predict/food` | Classify a food photo (`multipart/form-data`, field: `file`) |
| `POST` | `/api/predict/risk` | Predict risk scores from food logs + profile |

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

SHAP values follow XGBoost TreeExplainer sign convention: positive = increases disease risk, negative = reduces risk.

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Rwanda DHS 2019-20 training data | Ground-truth population statistics for Rwanda rather than generic or Western datasets |
| Meal-count scaling before inference | Model trained on daily totals; `scale = max(1, 3/n_meals)` extrapolates partial logs without collapsing the calorie signal used by overweight/diabetes models |
| 45% confidence threshold on food classifier | KenyanFood13 is a closed-world 13-class model; below-threshold results shown as suggestions, not accepted silently |
| SHAP TreeExplainer | Per-prediction explainability — users see *why* each score changed, not just the number |
| Harris-Benedict × 1.4 for calorie goals | Personalised daily targets from user age, sex, weight, and height |
| Scores capped at 90% | XGBoost without Platt scaling produces overconfident probabilities; cap prevents display of false certainty |

---

## Project Structure

```
nutrisense/
├── api/                          # FastAPI ML backend
│   ├── main.py                   # Routes
│   ├── food_predictor.py         # ViT inference
│   ├── risk_predictor.py         # XGBoost inference + SHAP
│   ├── nutrition_db.py           # Nutrient lookup (East African foods)
│   └── requirements.txt
├── src/
│   ├── routes/                   # Pages: index, dashboard, login, signup
│   ├── components/dashboard/     # All dashboard UI components
│   ├── hooks/                    # useAuth, useProfile, useFoodLogs
│   └── lib/                      # mlApi client, Supabase client
├── ML/
│   ├── nutrisense_training.ipynb # Full training pipeline (ViT + XGBoost)
│   └── outputs/                  # ROC curves, SHAP plots, confusion matrices
└── push_to_hf.py                 # Deploy API to HuggingFace Space
```

---

## ML Training

Notebooks are in `ML/`. Run on **Kaggle** (GPU T4 recommended):

1. Attach the `pytorch-opencv-course-classification` competition dataset
2. Add your `HF_TOKEN` as a Kaggle secret
3. Run `nutrisense_training.ipynb` end-to-end

Training outputs (ROC curves, confusion matrices, SHAP plots, CV results) are saved in `ML/outputs/`.

---

## Deploying API Updates

```bash
python push_to_hf.py --token hf_YOUR_TOKEN_HERE
```

Uploads all files in `api/` to the HuggingFace Space and triggers a rebuild (~2 min).

---

## Limitations & Future Work

- **Food classifier scope**: 13 East African classes (KenyanFood13). Rwanda-specific dishes (Isombe, Ibihaza, Umutsima) are out-of-distribution — the model surfaces its best guess with an amber confidence warning rather than a silent wrong answer.
- **Risk model calibration**: XGBoost without Platt scaling produces overconfident raw probabilities; scores are capped and a meal-count scaling heuristic is applied.
- **Future**: Fine-tune on a Rwanda-augmented food dataset; add Platt scaling to risk models; extend to hydration and activity tracking.

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
