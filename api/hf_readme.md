---
title: Nutrisense API
emoji: 🥗
colorFrom: green
colorTo: blue
sdk: docker
pinned: false
---

# Nutrisense-AI · FastAPI Backend

FastAPI server powering the Nutrisense-AI nutrition app.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/predict/food` | Classify a food image (ViT) |
| `POST` | `/api/predict/risk` | Predict health risks (XGBoost + SHAP) |
| `GET`  | `/health` | Liveness check |
