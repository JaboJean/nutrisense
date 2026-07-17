"""
Nutrisense-AI FastAPI backend.

Endpoints
---------
POST /api/predict/food   multipart image → FoodResult
POST /api/predict/risk   JSON logs + profile → Prediction
GET  /health             liveness check
"""
import os
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

# ── Lazy singletons (loaded once on first request) ────────────────────────────
_food_predictor = None
_risk_predictor = None


def food_predictor():
    global _food_predictor
    if _food_predictor is None:
        from food_predictor import FoodPredictor
        _food_predictor = FoodPredictor()
    return _food_predictor


def risk_predictor():
    global _risk_predictor
    if _risk_predictor is None:
        from risk_predictor import RiskPredictor
        _risk_predictor = RiskPredictor()
    return _risk_predictor


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm models at startup so first request isn't slow.
    # Food predictor is allowed to fail (model file may not be uploaded yet);
    # the Space still starts and the risk endpoint remains available.
    try:
        food_predictor()
    except Exception as exc:
        print(f"WARNING: food predictor failed to load at startup: {exc}")
        print("Food classification will return 503 until the model is uploaded.")
    try:
        risk_predictor()
    except Exception as exc:
        print(f"WARNING: risk predictor failed to load at startup: {exc}")
        print("Risk prediction will return 503 until the model is available.")
    yield


app = FastAPI(title="Nutrisense-AI API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# ── Schemas ───────────────────────────────────────────────────────────────────

class FoodResult(BaseModel):
    name:       str
    confidence: float
    kcal:       float
    protein:    float
    iron:       float
    fiber:      float
    vitC:       float
    glyph:      str
    tone:       str
    tag:        str


class LogItem(BaseModel):
    name: str
    meal: str = "Lunch"


class ProfileIn(BaseModel):
    age:      float = 30.0
    sex:      str   = "male"   # "male" | "female"
    weightKg: float = 70.0
    heightCm: float = 170.0


class RiskRequest(BaseModel):
    logs:    list[LogItem]
    profile: Optional[ProfileIn] = None


class ShapEntry(BaseModel):
    f: str
    v: float


class RiskScores(BaseModel):
    anemia:     int
    diabetes:   int
    overweight: int
    overall:    int


class Prediction(BaseModel):
    scores: RiskScores
    shap: dict[str, list[ShapEntry]]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/predict/food", response_model=FoodResult)
async def predict_food(image: UploadFile = File(...)):
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=422, detail="File must be an image")

    data = await image.read()
    if len(data) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image exceeds 10 MB limit")

    try:
        class_name, confidence = food_predictor().classify(data)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Inference error: {exc}")

    if confidence < 0.30:
        raise HTTPException(status_code=422, detail="not_food")

    from nutrition_db import get
    n = get(class_name)

    return FoodResult(
        name=n["display"],
        confidence=round(confidence, 4),
        kcal=n["kcal"],
        protein=n["protein"],
        iron=n["iron"],
        fiber=n["fiber"],
        vitC=n["vitC"],
        glyph=n["glyph"],
        tone=n["tone"],
        tag=n["tag"],
    )


@app.post("/api/predict/risk", response_model=Prediction)
def predict_risk(req: RiskRequest):
    profile = req.profile or ProfileIn()
    logs    = [l.model_dump() for l in req.logs]

    try:
        result = risk_predictor().predict(
            logs=logs,
            age=profile.age,
            sex=profile.sex,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction error: {exc}")

    return Prediction(
        scores=RiskScores(**result["scores"]),
        shap={
            disease: [ShapEntry(**e) for e in entries]
            for disease, entries in result["shap"].items()
        },
    )
