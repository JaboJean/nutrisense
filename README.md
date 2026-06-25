# NutriVision AI

**AI-powered diet-based disease risk prediction for Rwanda.**

NutriVision AI is a BSc Software Engineering capstone project at African Leadership University (ALU). It bridges the gap between what people eat and the nutrition-related diseases most affecting Rwanda — anemia, type 2 diabetes, and overweight — by combining a Rwandan Food Composition Database with a multi-output XGBoost machine learning model and SHAP-based explainability.

---

## The Problem

Rwanda faces a dual burden of malnutrition:
- **37%** of children aged 6–59 months are anemic (RDHS 2025)
- **26%** of women aged 15–49 are overweight or obese
- Adult diabetes prevalence estimated at **5.5%** (WHO 2024)

Existing tools (ZOE, DayTwo) cost USD 300–2,000 and are trained on Western food databases. Apps like MyFitnessPal lack disease prediction and don't cover Rwandan staples like Ubugali, Isombe, Ibishyimbo, or Matoke.

## The Solution

A free, accessible web platform that:
1. **Logs dietary intake** using a Rwandan Food Composition Database (100+ local foods)
2. **Predicts disease risk** for anemia, type 2 diabetes, and overweight simultaneously using a multi-output XGBoost model trained on RDHS microdata
3. **Explains the prediction** with SHAP values so users understand exactly which dietary patterns are driving their risk
4. **Recommends locally appropriate foods** that are affordable and available in the Rwandan food system

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TanStack Start (SSR) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Charts | Recharts |
| Backend *(planned)* | Flask REST API |
| Database *(planned)* | PostgreSQL |
| ML Model *(planned)* | XGBoost multi-output classifier |
| Auth *(planned)* | JWT tokens |
| Hosting *(planned)* | Render.com free tier |

---

## Project Structure

```
src/
├── routes/           # TanStack file-based routes
│   ├── __root.tsx    # App shell (layout, fonts, error handling)
│   └── index.tsx     # Main dashboard
├── components/
│   ├── ui/           # shadcn/ui primitives (Button, Card, Dialog, etc.)
│   └── dashboard/    # NutriVision-specific sections
├── data/             # Hardcoded seed/mock data
└── lib/              # Utilities
```

---

## Getting Started

**Prerequisites:** [Bun](https://bun.sh) ≥ 1.x

```bash
# Install dependencies
bun install

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Roadmap

- [x] Frontend dashboard design (health score, disease risk gauges, AI insight with SHAP, food log, recommendations)
- [ ] User authentication (register / login)
- [ ] Dietary intake logging with Rwandan Food Composition Database
- [ ] Flask backend API
- [ ] PostgreSQL schema (User, DietLog, DietLogItem, Food, NutrientProfile)
- [ ] XGBoost multi-output model training (Google Colab, RDHS 2019–20 + 2025 data)
- [ ] ML model integration (SHAP explainability per prediction)
- [ ] Recommendation engine
- [ ] Email notifications (SendGrid)
- [ ] User acceptance testing (15–20 participants at ALU Kigali)

---

## Research Targets

| Metric | Target |
|---|---|
| AUROC per disease | ≥ 0.75 |
| API response time | < 3 seconds |
| SUS usability score | ≥ 70 |

---

## Author

**JABO Jean Jacques** — BSc Software Engineering, African Leadership University  
Supervisor: Murairi Dirac
