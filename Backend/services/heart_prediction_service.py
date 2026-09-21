import joblib
import numpy as np


model = joblib.load(
    "models/heart_disease_model.pkl"
)

scaler = joblib.load(
    "models/heart_disease_scaler.pkl"
)


def predict_heart_disease(data):

    patient_data = [[
        data.male,
        data.age,
        data.education,
        data.currentSmoker,
        data.cigsPerDay,
        data.BPMeds,
        data.prevalentStroke,
        data.prevalentHyp,
        data.diabetes,
        data.totChol,
        data.sysBP,
        data.diaBP,
        data.BMI,
        data.heartRate,
        data.glucose
    ]]

    patient_data_scaled = scaler.transform(patient_data)

    prediction = model.predict(patient_data_scaled)[0]

    probability = model.predict_proba(
        patient_data_scaled
    )[0][1]

    return {
        "prediction": int(prediction),
        "probability": float(probability)
    }