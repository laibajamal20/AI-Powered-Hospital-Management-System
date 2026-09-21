from pydantic import BaseModel
from datetime import date


class MedicalRecordCreate(BaseModel):
    record_id: int
    patient_id: int
    doctor_id: int
    diagnosis: str
    signs: str
    treatment: str
    record_date: date


class MedicalRecordUpdate(BaseModel):
    diagnosis: str
    signs: str
    treatment: str
    record_date: date