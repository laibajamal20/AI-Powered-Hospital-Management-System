from fastapi import APIRouter

from schemas.heart_prediction import HeartPredictionRequest
from services.heart_prediction_service import (
    predict_heart_disease
)


router = APIRouter(
    prefix="/heart",
    tags=["Heart Disease Prediction"]
)


@router.post("/predict")
def predict(data: HeartPredictionRequest):

    result = predict_heart_disease(data)

    return result