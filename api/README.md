# Nutrisense-AI · FastAPI Backend

## Setup

### 1. Copy model files
```
_output_/
  food_finetuned_model.pth  →  api/models/food_finetuned_model.pth
  class_names.txt           →  api/models/class_names.txt
  nutrisense_model.joblib   →  api/models/nutrisense_model.joblib
```

### 2. Install dependencies
```bash
cd api
pip install -r requirements.txt
```

### 3. Run locally
```bash
uvicorn main:app --reload --port 8000
```

### 4. Wire the frontend
Create `.env.local` at the project root (copy from `.env.local.example`):
```
VITE_ML_API_URL=http://localhost:8000
```

Then restart Vite — the app will call the real models automatically.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/predict/food` | Classify a food image. Accepts `multipart/form-data` with field `image`. |
| `POST` | `/api/predict/risk` | Predict health risks from food logs + profile. Accepts JSON. |
| `GET`  | `/health` | Liveness check. |

### `/api/predict/food` response
```json
{
  "name": "Grilled Salmon",
  "confidence": 0.923,
  "kcal": 208,
  "protein": 28.0,
  "iron": 0.9,
  "fiber": 0.0,
  "vitC": 0.0,
  "glyph": "🐟",
  "tone": "sky",
  "tag": "Omega-3"
}
```

### `/api/predict/risk` request
```json
{
  "logs": [{ "name": "Grilled Salmon", "meal": "Lunch" }],
  "profile": { "age": 28, "sex": "female", "weightKg": 62, "heightCm": 165 }
}
```

### `/api/predict/risk` response
```json
{
  "scores": { "anemia": 42, "diabetes": 29, "overweight": 35, "overall": 35 },
  "shap": {
    "anemia":     [{ "f": "Iron intake", "v": -0.18 }, ...],
    "diabetes":   [{ "f": "Dietary fibre", "v": -0.24 }, ...],
    "overweight": [{ "f": "Caloric intake", "v": 0.31 }, ...]
  }
}
```

---

## Deployment (Hugging Face Spaces)

1. Create a new Space → **Docker** SDK.
2. Upload `api/` contents + model files into `models/`.
3. Add a `Dockerfile`:
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
```
4. Set `VITE_ML_API_URL=https://your-space.hf.space` in `.env.local`.
